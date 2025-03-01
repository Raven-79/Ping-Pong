from django.urls import path , include, re_path
from .consumers import TournamentConsumer


# Here, "" is routing to the URL ChatConsumer which 
# will handle the chat functionality.
websocket_urlpatterns = [
    re_path(r'ws/tournament/$', TournamentConsumer.as_asgi()),
] 
