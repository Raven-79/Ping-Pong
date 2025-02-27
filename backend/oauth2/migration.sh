
python -c "import my_shared_models"
# sleep 10


# pip install -e my_shared_models
python3 ./oauth2/manage.py makemigrations my_shared_models
python3 ./oauth2/manage.py migrate
python3 ./oauth2/manage.py runserver 0.0.0.0:8000

# def jwt_view(request):
#     login(request, user)
#     refresh = RefreshToken.for_user(user)
#     access_token = str(refresh.access_token)
#     expiration_time = datetime.fromtimestamp(
#         refresh["exp"], timezone.utc
#     )
#     current_time = datetime.now(timezone.utc)
#     remaining_time = expiration_time - current_time
#     max_age_seconds = int(remaining_time.total_seconds())
#     response = Response({"access_token": access_token})
#     response = redirect("https://localhost/")
#     response.set_cookie(
#         "refresh_token",
#         str(refresh),
#         httponly=True,
#         samesite="Strict",
#         max_age=max_age_seconds,
#     )
#     return response
