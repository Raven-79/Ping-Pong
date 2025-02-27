from typing import Optional, Tuple
from rest_framework_simplejwt.authentication import JWTAuthentication, AuthUser
from rest_framework_simplejwt.tokens import Token
from rest_framework.request import Request

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request: Request) -> Optional[Tuple[AuthUser, Token]]:
        result = super().authenticate(request)
        if result is None:
            return None
        
        if result[1].get("has_2fa_enabled", False) == False:
            return result
        
        if result[1].get("is_2fa_verified", False) == False:
            return None

        return result