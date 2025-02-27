from django.urls import path
from . import views, default_authentication, test_view, utils
from .utils import FriendsListView, AddFriendView, RemoveFriendView
from .default_authentication import RegisterView
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from datetime import datetime, timedelta, timezone
import jwt
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from django_otp.plugins.otp_totp.models import TOTPDevice


class TokenObtainPairView(TokenViewBase):
    serializer_class = TokenObtainPairSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        user = serializer.user
        profile = user.profile

        refresh_token = RefreshToken.for_user(user)
        refresh_token["has_2fa_enabled"] = profile.is_2fa_enabled
        refresh_token["is_2fa_verified"] = False

        expiration_time = datetime.fromtimestamp(refresh_token["exp"], timezone.utc)
        current_time = datetime.now(timezone.utc)
        remaining_time = expiration_time - current_time
        max_age_seconds = int(remaining_time.total_seconds())

        data = {
            "access": str(refresh_token.access_token),
            "2FA_required": profile.is_2fa_enabled,
        }

        response = Response(data, status=status.HTTP_200_OK)

        response.set_cookie(
            "refresh_token",
            str(refresh_token),
            httponly=True,
            max_age=max_age_seconds,
            secure=True,
            samesite="Strict",
        )

        return response

    def generate_temp_token(self, user):
        current_time = datetime.now(timezone.utc)
        payload = {
            "user_id": user.id,
            "type": "temp_token",
            "exp": current_time + timedelta(minutes=5),
            "iat": current_time,
        }

        temp_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return temp_token


class TokenRefreshView(TokenViewBase):
    serializer_class = TokenRefreshSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            raise InvalidToken("Refresh token not provided")
        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        refresh = RefreshToken(refresh_token)
        has_2fa = refresh.get("has_2fa_enabled", False) == True
        verified_2fa = refresh.get("is_2fa_verified", False) == True
        if has_2fa and not verified_2fa:
            raise InvalidToken("2FA verification required")

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class Verify2Fa(TokenViewBase):
    serializer_class = TokenRefreshSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            raise InvalidToken("Refresh token not provided")

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        user = request.user
        otp_code = request.data.get("otp_code")
        if not otp_code:
            return Response(
                {"error": "2FA code not provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken(refresh_token)
        user_id = refresh.payload.get(api_settings.USER_ID_CLAIM, None)
        if user_id and (
            user := get_user_model().objects.get(
                **{api_settings.USER_ID_FIELD: user_id}
            )
        ):
            if not api_settings.USER_AUTHENTICATION_RULE(user):
                raise AuthenticationFailed(
                    self.error_messages["no_active_account"],
                    "no_active_account",
                )

        refresh["is_2fa_verified"] = True

        totp_device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if not totp_device:
            return Response({"error": "2FA not enabled for this user."}, status=400)

        if totp_device.verify_token(otp_code):
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


urlpatterns = [
    # jwt tokens
    path("jwt_view/", views.jwt_view, name="jwt_view"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/verify/", views.verify, name="verify"),
    path("api/logout", views.logout, name="correct_logout"),
    # authentication
    # path("health/", Health.as_view(), name="health"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("signup/", RegisterView.as_view(), name="signup"),
    path("intra_login/", views.intra_login_view, name="intra_login"),
    path("callback/", views.callback_view, name="callback"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    # 2FA
    path("generate-qr/", views.generate_qr_code, name="generate_qr"),
    path("verify-otp/", views.verify_otp, name="verify_otp"),
    path("verify_2fa/", views.verify_2fa, name="verify_2fa"),
    path("verify_2fa_tmp/", Verify2Fa.as_view(), name="verify_2fa_tmp"),
    path("tmp1/", views.tmp1, name="tmp1"),
    path("tmp2/", views.tmp2, name="tmp2"),
]
