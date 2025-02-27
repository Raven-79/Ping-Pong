from rest_framework import serializers
from .models import Friendship, Profile, Friend, User


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "profile"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Use set_password to hash the password
        user = User(email=validated_data["email"], username=validated_data["username"])
        user.set_password(validated_data["password"])  # Hash the password
        user.save()
        return user

    def get_profile(self, obj):
        profile = Profile.objects.get(user=obj)
        return ProfileSerializer(profile).data


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    class Meta:
        model = Profile
        fields = [
            "user",
            "username",
            "avatar",
            
            "first_name",
            "last_name",
            "display_name",
            "language",
            "points",
            "level",
            "wins",
            "losses",
            "win_rate",
            "win_streak",
            "is_2fa_enabled",
            "total_games",
            "bio",
            "login_mode",
        ]

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get("avatar", instance.avatar)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.display_name = validated_data.get(
            "display_name", instance.display_name
        )
        instance.language = validated_data.get("language", instance.language)
        instance.points = validated_data.get("points", instance.points)
        instance.wins = validated_data.get("wins", instance.wins)
        instance.losses = validated_data.get("losses", instance.losses)
        instance.win_rate = validated_data.get("win_rate", instance.win_rate)
        instance.win_streak = validated_data.get("win_streak", instance.win_streak)
        instance.is_2fa_enabled = validated_data.get(
            "is_2fa_enabled", instance.is_2fa_enabled
        )
        instance.total_games = validated_data.get("total_games", instance.total_games)
        instance.bio = validated_data.get("bio", instance.bio)
        instance.save()
        return instance


class PlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = [
            "user_id",
            "avatar",
            "display_name",
            "level",
        ]


class ProfileRankingSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Profile
        fields = [
            "user_id",
            "username",
            "email",
            "avatar",
            "first_name",
            "last_name",
            "display_name",
            "level",
            "points",
            "wins",
            "losses",
            "total_games",
        ]


class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ["user", "friend", "status"]


class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ["id", "user", "friend", "created_at"]
        fields = ["user", "friend", "status"]



