from django.urls import path
from django.urls import re_path
from . import consumers
from . import consumers2

websocket_urlpatterns = [
    # re_path(r'ws/game/tester/$', consumers2.PlayerConsumer.as_asgi()),
    re_path(r'ws/game/pong3d/$', consumers.PlayerConsumer.as_asgi()),
    re_path(r'ws/game/tic-tac-toe/$', consumers2.PlayerConsumer.as_asgi())
]