from rest_framework import serializers
from my_shared_models.serializers import UserSerializer
from .models import Game


class GameSerializer(serializers.ModelSerializer):
    player_one = UserSerializer()
    player_two = UserSerializer()

    class Meta:
        model = Game
        fields = [
            "id",
            "winner",
            "score",
            "date_played",
            "duration",
            "game_mode",
            "player_one",
            "player_two",
            "tournament",
            "status",
        ]

class GameHistorySerializer(serializers.ModelSerializer):
    player_one = UserSerializer()
    player_two = UserSerializer()

    class Meta:
        model = Game
        fields = [
            "id",
            "winner",
            "score",
            "date_played",
            "duration",
            "game_mode",
            "player_one",
            "player_two",
        ]
