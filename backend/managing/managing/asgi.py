"""
ASGI config for managing project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from managing.middleware import TokenAuthMiddleware

from chat.routing import websocket_urlpatterns as chat_urlpatterns
from tournaments.routing import websocket_urlpatterns as tournament_urlpatterns



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'managing.settings')

application = ProtocolTypeRouter(
    {
        "http" : get_asgi_application() , # For HTTP requests
        "websocket" : TokenAuthMiddleware(# ensures that the user authentication system  works for WebSockets.
            URLRouter(
                chat_urlpatterns + tournament_urlpatterns 
            ) 
        )
    }
)
