import requests
from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views import View
from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.utils.crypto import get_random_string
from django.urls import reverse
from my_shared_models.models import Profile
from .utils import generate_qr_code, verify_otp, tmp1, tmp2, verify_2fa
from django.middleware.csrf import CsrfViewMiddleware, get_token
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponseRedirect
from rest_framework.decorators import api_view
from datetime import datetime, timezone
import urllib
from rest_framework.decorators import authentication_classes, permission_classes


def jwt_view(request, user):
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    expiration_time = datetime.fromtimestamp(refresh["exp"], timezone.utc)

    current_time = datetime.now(timezone.utc)
    remaining_time = expiration_time - current_time
    max_age_seconds = int(remaining_time.total_seconds())
    response = redirect("https://localhost/:8443")
    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        samesite="Strict",
        max_age=max_age_seconds,
        secure=True,
    )
    return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(username=username, password=password)

        if user is not None:
            # login(request, user)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            # response = HttpResponseRedirect('http://127.0.0.1:5500/#/')
            expiration_time = datetime.fromtimestamp(
                refresh["exp"], timezone.utc
            )  # Expiration as timezone-aware
            current_time = datetime.now(timezone.utc)  # Current time as timezone-aware
            remaining_time = expiration_time - current_time
            max_age_seconds = int(remaining_time.total_seconds())
            response = Response({"access_token": access_token})
            # response.set_cookie(
            #     key = 'access_token',
            #     value = access_token,
            #     httponly = True,
            #     # samesite = 'none',
            #     # secure=False,
            #     # domain = 'localhost',
            #     path = '/',
            # )
            response.set_cookie(
                "refresh_token",
                str(refresh),
                httponly=True,
                # secure=settings.USE_HTTPS,
                samesite="Strict",
                max_age=max_age_seconds,
                secure=True,
            )
            return response
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


@api_view(["GET", "POST"])
@authentication_classes([])
@permission_classes([])
def callback_view(request):
    code = request.query_params.get("code")
    if not code:
        return Response({"error": "Authorization code not provided"}, status=400)
    token_url = "https://api.intra.42.fr/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.FORTY_TWO_CLIENT_ID,
        "client_secret": settings.FORTY_TWO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.REDIRECT_URI,
    }
    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        # print("test")
        token_data = response.json()
        access_token = token_data.get("access_token")
        if access_token:
            # Fetch user info
            user_info_url = "https://api.intra.42.fr/v2/me"
            headers = {"Authorization": f"Bearer {access_token}"}
            user_response = requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            # Authenticate user
            user = authenticate(
                request,
                avatar=user_data["image"]["link"],
                language="en",
                login=user_data["login"],
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                display_name=user_data["login"],
                login_mode="intra",
            )
            if user:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                refresh["has_2fa_enabled"] = user.profile.is_2fa_enabled
                refresh["is_2fa_verified"] = False
                access_token = str(refresh.access_token)
                print("^" * 20)
                # redirect must come from .env
                # if user.profile.is_2fa_enabled:
                #     response = redirect("https://localhost:8443/#/verify-2fa")
                # else:
                response = redirect("https://localhost:8443/")
                expiration_time = datetime.fromtimestamp(refresh["exp"], timezone.utc)
                current_time = datetime.now(timezone.utc)
                remaining_time = expiration_time - current_time
                max_age_seconds = int(remaining_time.total_seconds())
                response.set_cookie(
                    "refresh_token",
                    str(refresh),
                    httponly=True,
                    max_age=max_age_seconds,
                    secure=True,
                    samesite="Strict",
                )
                return response
            else:
                return Response({"error": "Authentication failed"}, status=401)
        else:
            return Response({"error": "Access token not found in response"}, status=400)
    except requests.exceptions.RequestException as e:
        return Response(
            {"error": f"Failed to obtain access token: {str(e)}"}, status=400
        )


def intra_login_view(request):
    # state = get_random_string(32)
    # request.session['oauth_state'] = state

    auth_url = (
        f"https://api.intra.42.fr/oauth/authorize"
        f"?client_id={settings.FORTY_TWO_CLIENT_ID}"
        f"&redirect_uri={settings.REDIRECT_URI}"
        f"&response_type=code"
        # f"&state={state}"
        # f"&force_verify=true"
    )

    response = redirect(auth_url)
    # response.delete_cookie('_intra_42_session_production')
    return response


@method_decorator(login_required, name="dispatch")
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        # print("logiiiiiinout")
        return Response({"message": "Logged out successfully"})


@api_view(["POST"])
def logout(request):

    response = Response({"success": True})
    response.delete_cookie("refresh_token")
    return response


@api_view(["GET"])
def verify(request):
    return Response({"success": True})
