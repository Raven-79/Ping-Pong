from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from my_shared_models.models import Friend, Profile, User
from my_shared_models.serializers import (
    ProfileSerializer,
    UserSerializer,
    ProfileRankingSerializer,
)
from .serializers import GameSerializer, GameHistorySerializer
from .models import Game
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
import requests
from my_shared_models.tools import download_image, path_to_image
from django.core.files import File
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.shortcuts import redirect
from datetime import datetime, timedelta
import time
from django.contrib.auth.hashers import check_password


class WeekStatics(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id=None):
        if id is None:
            user = request.user
        else:
            user = get_object_or_404(User, id=id)

        games = Game.objects.filter(Q(player_one=user) | Q(player_two=user)).order_by(
            "-date_played"
        )
        WeekStatics = [{"win": 0, "lose": 0} for _ in range(4)]
        for game in games:
            for i, week in enumerate(self.get_last_weeks_limits()):
                if (
                    week["start"]
                    <= game.date_played.strftime("%Y-%m-%d")
                    <= week["end"]
                ):
                    if game.winner == user:
                        WeekStatics[i]["win"] += 1
                    else:
                        WeekStatics[i]["lose"] += 1
                    break
        return Response(WeekStatics[::-1], status=status.HTTP_200_OK)

    def get_last_weeks_limits(self):
        today = datetime.now()
        days_since_monday = today.weekday()
        last_monday = today - timedelta(days=days_since_monday)

        return [
            {
                "start": (last_monday - timedelta(weeks=i)).strftime("%Y-%m-%d"),
                "end": (last_monday - timedelta(weeks=i) + timedelta(days=6)).strftime(
                    "%Y-%m-%d"
                ),
            }
            for i in range(4)
        ]


class UpdateCurrentUser(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = get_object_or_404(User, id=request.user.id)
        profile = user.profile

        user_serializer = UserSerializer(user, data=request.data, partial=True)
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if user_serializer.is_valid(
            raise_exception=True
        ) and profile_serializer.is_valid(raise_exception=True):
            user_serializer.save()
            profile_serializer.save()

            avatar_path = request.data.get("avatar")
            if avatar_path:
                path_to_image(avatar_path, user)
            return Response(profile_serializer.data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid data."}, status=status.HTTP_400_BAD_REQUEST)


class Health(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("search", "").strip()
        if not query:
            return Response(
                {"error": "No search query provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = User.objects.filter(
            Q(username__istartswith=query)
            | Q(profile__first_name__istartswith=query)
            | Q(profile__last_name__istartswith=query)
        ).distinct()[:10]
        user_data = [{"id": user.id, "username": user.username} for user in users]

        user_data = []
        for user in users:
            profile = Profile.objects.get(user=user)
            user_data.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                    "display_name": profile.display_name,
                    "avatar": profile.avatar.url if profile else None,
                }
            )

        return Response(user_data, status=status.HTTP_200_OK)


class PlayerRankingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ranked_profiles = Profile.objects.all().order_by("-level", "-points")
        serializer = ProfileRankingSerializer(ranked_profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GameHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = kwargs.get("id")
        if user_id:
            user = get_object_or_404(User, id=user_id)
        else:
            user = request.user
        games = Game.objects.filter(Q(player_one=user) | Q(player_two=user)).order_by(
            "-date_played"
        )
        serializer = GameHistorySerializer(games, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserStatistics(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = kwargs.get("id")
        if user_id:
            user = get_object_or_404(User, id=user_id)
        else:
            user = request.user
        pong_games = Game.objects.filter(
            (Q(player_one=user) | Q(player_two=user)) & Q(game_mode="Pong")
        )
        # print("total games ",pong_games.count(),flush=True)
        pong_wins = pong_games.filter(winner=user).count()
        pong_losses = pong_games.filter(~Q(winner=user)).count()
        tic_tac_toe_games = Game.objects.filter(
            (Q(player_one=user) | Q(player_two=user)) & Q(game_mode="TicTacToe")
        )
        # print("total games tic tac ",tic_tac_toe_games.count(),flush=True)
        tic_tac_toe_wins = tic_tac_toe_games.filter(winner=user).count()
        tic_tac_toe_losses = tic_tac_toe_games.filter(
            ~Q(winner=user) & ~Q(winner=None)
        ).count()
        tic_tac_toe_draw = tic_tac_toe_games.filter(winner=None).count()
        return Response(
            {
                "pong": {
                    "wins": pong_wins,
                    "losses": pong_losses,
                },
                "tic_tac_toe": {
                    "wins": tic_tac_toe_wins,
                    "losses": tic_tac_toe_losses,
                    "draws": tic_tac_toe_draw,
                },
            },
            status=status.HTTP_200_OK,
        )


class IsUserLoggedInView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response(
                {"message": "User is logged in."}, status=status.HTTP_200_OK
            )
        return Response(
            {"message": "User is not logged in."}, status=status.HTTP_401_UNAUTHORIZED
        )


class CurrentUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ShowUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        user = get_object_or_404(User, id=id)

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        return Response(user_data, status=status.HTTP_200_OK)


class ShowProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.id == id:
            return Response({"redirect": True}, status=status.HTTP_200_OK)

        user = get_object_or_404(User, id=id)
        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(profile)
        data = serializer.data

        friendship = Friend.objects.filter(
            Q(user=request.user, friend=user) | Q(user=user, friend=request.user)
        ).first()

        if not friendship:
            data["status"] = "not_friends"
        elif friendship.status == Friend.STATUS_BLOCKED:
            data["status"] = (
                "blocked" if friendship.user == request.user else "blocked_by"
            )
        elif friendship.status == Friend.STATUS_PENDING:
            data["status"] = (
                "pending" if friendship.user == request.user else "pending_by"
            )
        elif friendship.status == Friend.STATUS_ACCEPTED:
            data["status"] = "friends"
        else:
            return Response(
                {"error": "Invalid friendship status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(data, status=status.HTTP_200_OK)


class ShowCurrentProfile(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user

        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListUsers(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class ListProfiles(ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)

            if request.user == user:
                return Response(
                    {"error": "You cannot delete yourself!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.delete()
            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ChangeImage(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        file = request.FILES.get("avatar")

        if not file:
            return Response({"error": "Avatar file is required."}, status=400)

        profile, created = Profile.objects.get_or_create(user=user)

        if profile.avatar:
            profile.avatar.delete(save=False)

        profile.avatar.save(f"{user.id}.png", file, save=True)

        return Response({"success": "Avatar updated successfully."}, status=200)


class DeleteImage(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)

        default_image_path = f"{settings.MEDIA_ROOT}/default.png"
        with open(default_image_path, "rb") as default_image:
            profile.avatar.save(f"{user.id}.png", File(default_image), save=True)

        return Response({"success": "Avatar deleted successfully."}, status=200)
