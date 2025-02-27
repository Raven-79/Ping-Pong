from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

@sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken(token)

        return User.objects.get(id=access_token["user_id"])
    except Exception:
        print(f"Error resolving token: {e}")
        return AnonymousUser()
    

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):

        query_string = scope["query_string"].decode()
        query_params = dict(qc.split("=") for qc in query_string.split("&") if "=" in qc)
        token = query_params.get("token")

        if token:
            print(f"Token received: {token}")  # Log the token
            scope["user"] = await get_user_from_token(token)
        else:
            print("No token found in query string")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
