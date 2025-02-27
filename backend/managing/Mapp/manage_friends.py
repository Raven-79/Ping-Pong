from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from my_shared_models.models import User, Friend, Profile
from my_shared_models.serializers import (
    UserSerializer,
    FriendSerializer,
    ProfileSerializer,
)
from django.shortcuts import get_object_or_404
from django.db.models import Q

from chat.models import Chat


@api_view(["GET"])
def get_friends(request, user_id=None):
    if user_id is None:
        user_id = request.user.id

    user = get_object_or_404(User, id=user_id)

    friends = Friend.objects.filter(
        (Q(user=user) | Q(friend=user)) & Q(status=Friend.STATUS_ACCEPTED)
    )

    friends_list = []
    for friend in friends:
        friend_user = friend.friend if friend.user == user else friend.user
        friends_list.append(friend_user)

    serialized_data = UserSerializer(friends_list, many=True).data
    return Response(serialized_data)


@api_view(["GET"])
def get_pending_friends(request):
    user = request.user
    pending_friends = Friend.objects.filter(friend=user, status=Friend.STATUS_PENDING)
    pending_friends_list = [friendship.user for friendship in pending_friends]
    serializer = UserSerializer(pending_friends_list, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_blocked_friends(request):
    user = request.user
    blocked_friends = Friend.objects.filter(user=user, status=Friend.STATUS_BLOCKED)
    blocked_friends_list = [friendship.friend for friendship in blocked_friends]
    serializer = UserSerializer(blocked_friends_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def send_friend_request(request):

    friend_id = request.data.get("friend_id")

    user = request.user
    friend = get_object_or_404(User, id=friend_id)

    # Check if the friendship already exists
    if Friend.objects.filter(
        Q(user=user, friend=friend) | Q(user=friend, friend=user)
    ).exists():
        return Response(
            {"detail": "Friend request already sent or already friends"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    friendship = Friend.objects.create(
        user=user, friend=friend, status=Friend.STATUS_PENDING
    )
    serializer = FriendSerializer(friendship)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
def cancel_friend_request(request):
    user_id = request.user.id
    friend_id = request.data.get("friend_id")

    friendship = get_object_or_404(Friend, user=user_id, friend=friend_id)
    if friendship.status != Friend.STATUS_PENDING:
        return Response(
            {"detail": "status is not pending"}, status=status.HTTP_400_BAD_REQUEST
        )
    friendship.delete()
    return Response(
        {"detail": "request canceled successfully"}, status=status.HTTP_204_NO_CONTENT
    )


@api_view(["POST"])
def accept_friend_request(request):
    user_id = request.user.id
    friend_id = request.data.get("friend_id")

    friendship = get_object_or_404(Friend, user=friend_id, friend=user_id)

    if friendship.status == Friend.STATUS_ACCEPTED:
        return Response(
            {"detail": "Friend request already accepted"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    

    friendship.status = Friend.STATUS_ACCEPTED
    friendship.save()

    chat_exists = Chat.objects.filter(fromUser=user_id, toUser=friend_id).exists() or \
                  Chat.objects.filter(fromUser=friend_id, toUser=user_id).exists()

    if not chat_exists:
        Chat.objects.create(fromUser_id=user_id, toUser_id=friend_id)




    serializer = FriendSerializer(friendship)
    return Response(serializer.data)


@api_view(["DELETE"])
def reject_friend_request(request):
    user_id = request.user.id
    friend_id = request.data.get("friend_id")

    friendship = get_object_or_404(Friend, user=friend_id, friend=user_id)
    if friendship.status != Friend.STATUS_PENDING:
        return Response(
            {"detail": "status is not pending"}, status=status.HTTP_400_BAD_REQUEST
        )
    friendship.delete()
    return Response(
        {"detail": "request rejected successfully"}, status=status.HTTP_204_NO_CONTENT
    )


@api_view(["DELETE"])
def delete_friend(request):
    user_id = request.user.id
    friend_id = request.data.get("friend_id")

    friendship = Friend.objects.filter(
        (Q(user=user_id) & Q(friend=friend_id))
        | (Q(user=friend_id) & Q(friend=user_id))
    ).first()

    if not friendship:
        return Response(
            {"detail": "Friendship not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if friendship.status != Friend.STATUS_ACCEPTED:
        return Response(
            {"detail": "Friendship not accepted"}, status=status.HTTP_400_BAD_REQUEST
        )
    friendship.delete()
    return Response(
        {"detail": "friend deleted successfully"}, status=status.HTTP_204_NO_CONTENT
    )


@api_view(["PUT"])
def block_friend(request):
    user_id = request.user.id
    friend_id = request.data.get("friend_id")

    friendship = Friend.objects.filter(
        (Q(user=user_id) & Q(friend=friend_id))
        | (Q(user=friend_id) & Q(friend=user_id))
    ).first()
    if not friendship:
        return Response(
            {"detail": "Friendship not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if friendship.status == Friend.STATUS_BLOCKED:
        return Response(
            {"detail": "Friend already blocked"}, status=status.HTTP_400_BAD_REQUEST
        )
    friendship.status = Friend.STATUS_BLOCKED
    if friendship.friend == request.user:
        friendship.user, friendship.friend = friendship.friend, friendship.user
    friendship.save()
    serializer = FriendSerializer(friendship)
    return Response(serializer.data)


@api_view(["PUT"])
def unblock_friend(request):
    user_id = request.user.id
    friend_id = request.data.get("friend_id")

    friendship = Friend.objects.filter(
        (Q(user=user_id) & Q(friend=friend_id))
        | (Q(user=friend_id) & Q(friend=user_id))
    ).first()

    if friendship.status != Friend.STATUS_BLOCKED:
        return Response(
            {"detail": "Friend not blocked"}, status=status.HTTP_400_BAD_REQUEST
        )

    friendship.delete()
    return Response(
        {"detail": "friend unblocked successfully"}, status=status.HTTP_204_NO_CONTENT
    )
