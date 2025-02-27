from django.urls import path, include
from chat import views as chat_views
# from django.contrib.auth.views import LoginView, LogoutView
from . import views
# from .views import CustomLoginView

urlpatterns = [
    # path("", chat_views.chatPage, name="chat-page"),
    # path("auth/login/", CustomLoginView.as_view(template_name="chat/LoginPage.html"), name="login-user"),
    # path("auth/logout/", LogoutView.as_view(), name="logout-user"),
    
    path('api/conversations/', views.get_conversations, name='get-conversations'),
    path('api/messages/<int:chat_id>/', views.get_messages, name='get-messages'),
]

# urlpatterns = [
#     path('', views.index, name='index'),
#     path('<str:room_name>/', views.room, name='room'),
# ]