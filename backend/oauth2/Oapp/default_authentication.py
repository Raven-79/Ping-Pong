import os
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from my_shared_models.models import Profile, User
from django.db import IntegrityError
from rest_framework.permissions import AllowAny
from django.contrib.auth import login
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponseRedirect
from django.core.files import File
from rest_framework.response import Response
from datetime import datetime, timezone


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_name = request.data.get("user_name")
        password = request.data.get("password")
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        # Validate input fields
        if not all([user_name, password, email, first_name, last_name]):
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if username or email is already taken
        if User.objects.filter(username=user_name).exists():
            return Response(
                {"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(
                username=user_name, email=email, password=password
            )
            profile, created = Profile.objects.get_or_create(user=user)
            profile.first_name = first_name
            profile.last_name = last_name
            profile.language = "en"
            profile.display_name = user_name
            profile.login_mode = "email"

            default_avatar_path = os.path.join(
                settings.MEDIA_ROOT, "default_avatar", "default.jpeg"
            )
            if os.path.exists(default_avatar_path):
                with open(default_avatar_path, "rb") as avatar_file:
                    profile.avatar.save(f"{user.id}.png", File(avatar_file), save=True)
            profile.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response_data = {
                "message": "User created successfully.",
                "access_token": access_token,
            }
            response = Response(response_data, status=status.HTTP_201_CREATED)

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

        except IntegrityError as e:
            return Response(
                {"error": "An error occurred while creating the user. " + str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# class Health(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         return Response({"message": "Health check passed."}, status=status.HTTP_200_OK)