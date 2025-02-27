# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from .forms import CustomLoginForm

# from asgiref.sync import database_sync_to_async
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from .models import Message, Chat  # Import the Message model
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from my_shared_models.models import User, Friend, Profile
from django.db.models import Q


User = get_user_model()
# This function will render the chat page
# @login_required(login_url='/auth/login/')
# def chatPage(request, *args, **kwargs):
#     if not request.user.is_authenticated:# If user is not authenticated, redirect to login page
#         return redirect("login-user")\
#     # Get all users except the logged-in user
#     users = User.objects.exclude(id=request.user.id)
#     context = {
#         'users': users,
#     }
#     return render(request, "chat/ChatPage.html", context)# Render the chat page

# class CustomLoginView(LoginView):
#     template_name = 'chat/LoginPage.html'  # Path to your login template
#     form_class = CustomLoginForm


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    accepted_friends = Friend.objects.filter(
        Q(user=request.user) | Q(friend=request.user), status=Friend.STATUS_ACCEPTED
    )

    friend_users = set()
    for friendship in accepted_friends:
        if friendship.user == request.user:
            friend_users.add(friendship.friend.id)
        else:
            friend_users.add(friendship.user.id)

    chats = Chat.objects.filter(
        (Q(fromUser=request.user) & Q(toUser__id__in=friend_users))
        | (Q(toUser=request.user) & Q(fromUser__id__in=friend_users))
    )

    response = []

    for chat in chats:
        other_user = chat.other_user(request.user)
        friend = Friend.objects.filter(
            Q(user=other_user, friend=request.user.id)
            | Q(user=request.user.id, friend=other_user)
        ).first()
        is_blocked = friend.status == "blocked" if friend else False

        last_message = chat.last_message()
        response.append(
            {
                "id": chat.id,
                "name": other_user.profile.display_name,
                "friend_id": other_user.id,
                "avatar": (
                    other_user.profile.avatar.url
                    if other_user.profile.avatar
                    else "default.png"
                ),
                "lastMessage": {
                    "text": last_message.message if last_message else "",
                    "time": (
                        last_message.createdAt.strftime("%Y-%m-%d %H:%M:%S")
                        if last_message
                        else ""
                    ),
                },
                "unreadMessages": Message.objects.filter(refChat=chat, isRead=False)
                .exclude(author=request.user.id)
                .count(),
                "isOnline": False,
                "isBlocked": is_blocked,
            }
        )
    return JsonResponse(response, safe=False)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, chat_id):
    messages = Message.objects.filter(refChat_id=chat_id)
    response = [
        {
            "id": message.id,
            "sender": "user" if message.author == request.user else "other",
            "text": message.message,
            "time": message.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
            "message_type": message.type,
            "invitation": serialize_invite(message.invitation),
        }
        for message in messages
    ]
    return JsonResponse(response, safe=False)


def serialize_invite(invite):
    if invite:
        return {
            "id": invite.id,
            "from_user": invite.from_user.id,
            "to_user": invite.to_user.id,
            "is_expired": invite.is_expired,
            "created_at": invite.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "game_mode": invite.game_mode,
        }
    return None
