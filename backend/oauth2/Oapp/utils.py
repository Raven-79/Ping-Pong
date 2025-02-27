from datetime import timedelta, timezone
import qrcode
import io
import pyotp
from django.http import HttpResponse
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from PIL import Image
from rest_framework import status
from rest_framework.generics import ListAPIView
from my_shared_models.models import Profile, Friendship, User
from my_shared_models.serializers import (
    ProfileSerializer,
    UserSerializer,
    FriendshipSerializer,
)
import jwt
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta, timezone

# from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import authentication_classes, permission_classes


@api_view(["GET"])
def generate_qr_code(request):
    user = request.user

    # Check if the user is authenticated
    if not user.is_authenticated:
        return HttpResponse("Unauthorized", status=401)

    # Create a TOTP device for the user
    totp_device, created = TOTPDevice.objects.get_or_create(user=user, name="default")

    # Get the provisioning URI (for Google Authenticator or similar apps)
    provisioning_uri = totp_device.config_url

    # Generate a QR code from the provisioning URI
    qr = qrcode.make(provisioning_uri)

    # Convert the QR code into an image
    buffer = io.BytesIO()
    qr_img = qr.convert("RGB")  # Convert QR code to an RGB image
    qr_img.save(buffer, format="PNG")  # Save the image to the buffer
    buffer.seek(0)

    # Return the QR code as an image
    return HttpResponse(buffer.getvalue(), content_type="image/png")


@api_view(["POST"])
def verify_otp(request):
    user = request.user

    # Check if the user is authenticated
    if not user.is_authenticated:
        return Response({"status": "unauthorized"}, status=401)

    otp_code = request.data.get("otp_code")

    # Find the user's TOTP device
    try:
        totp_device = TOTPDevice.objects.get(user=user, confirmed=True)
        if totp_device.verify_token(otp_code):
            return Response({"status": "verified"}, status=200)
        else:
            return Response({"status": "invalid code"}, status=400)
    except TOTPDevice.DoesNotExist:
        return Response({"status": "no device found"}, status=404)


@api_view(["GET"])
def tmp1(request):
    print(type(request.user.username), flush=True)
    return Response(request.user)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def verify_2fa(request):
    tmp_token = request.data.get("tmp_token")
    otp_code = request.data.get("otp_code")

    if not tmp_token or not otp_code:
        return Response({"error": "tmp_token and otp_code are required."}, status=400)

    try:
        decoded_data = jwt.decode(tmp_token, settings.SECRET_KEY, algorithms=["HS256"])

        user_id = decoded_data.get("user_id")
        issued_at = decoded_data.get("iat")
        print(f"====================> {user_id} {issued_at}", flush=True)
        if not user_id or not issued_at:
            raise ValidationError("Invalid token data")
        issued_at_time = datetime.fromtimestamp(issued_at, timezone.utc)
        expiration_time = issued_at_time + timedelta(minutes=5)

        if datetime.now(timezone.utc) > expiration_time:
            return Response({"error": "tmp_token expired."}, status=400)

        user = User.objects.get(id=user_id)
        totp_device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if not totp_device:
            return Response({"error": "2FA not enabled for this user."}, status=400)

        if totp_device.verify_token(otp_code):
            user = User.objects.get(id=user_id)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response_data = {
                "access_token": access_token,
            }
            response = Response(response_data, status=status.HTTP_200_OK)

            expiration_time = datetime.fromtimestamp(refresh["exp"], timezone.utc)
            current_time = datetime.now(timezone.utc)
            remaining_time = expiration_time - current_time
            max_age_seconds = int(remaining_time.total_seconds())
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                max_age=max_age_seconds,
                secure=True, 
                samesite="Strict",
            )

            return response
        else:
            return Response({"error": "Invalid OTP code."}, status=400)

    except jwt.ExpiredSignatureError:
        return Response({"error": "tmp_token has expired."}, status=400)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid tmp_token."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def tmp2(request):
    return Response(request.user)


# path('friends/<int:user_id>/', FriendsListView.as_view(), name='friends-list'),
# path('friends/add/', AddFriendView.as_view(), name='add-friend'),
# path('friends/remove/', RemoveFriendView.as_view(), name='remove-friend'),


class FriendsListView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            friends = Friendship.objects.filter(user=user)
            serializer = FriendshipSerializer(friends, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class AddFriendView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        friend_id = request.data.get("friend_id")
        try:
            user = User.objects.get(id=user_id)
            friend = User.objects.get(id=friend_id)
            # print(friend.username)
            # Check if they are already friends
            if Friendship.objects.filter(user=user, friend=friend).exists():
                return Response(
                    {"error": "Already friends"}, status=status.HTTP_400_BAD_REQUEST
                )
            # Create a new friendship
            friendship = Friendship(user=user, friend=friend)
            friendship.save()
            return Response({"message": "Friend added"}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response(
                {"error": "User or Friend not found"}, status=status.HTTP_404_NOT_FOUND
            )


class RemoveFriendView(APIView):
    def delete(self, request):
        user_id = request.data.get("user_id")
        friend_id = request.data.get("friend_id")
        try:
            user = User.objects.get(id=user_id)
            friend = User.objects.get(id=friend_id)
            # Check if the friendship exists
            friendship = Friendship.objects.filter(user=user, friend=friend).first()
            if not friendship:
                return Response(
                    {"error": "Friendship does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Remove friendship
            friendship.delete()
            return Response({"message": "Friend removed"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"error": "User or Friend not found"}, status=status.HTTP_404_NOT_FOUND
            )
