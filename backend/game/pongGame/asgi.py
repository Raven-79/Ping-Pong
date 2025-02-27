

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from . import routing
from pongGame.middleware import TokenAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')


application = ProtocolTypeRouter({
    'http':get_asgi_application(),
    "websocket" : TokenAuthMiddleware(# ensures that the user authentication system  works for WebSockets.
            URLRouter(
                routing.websocket_urlpatterns
            )    
    )
})