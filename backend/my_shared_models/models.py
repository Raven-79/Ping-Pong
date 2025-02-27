from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser

from django.conf import settings
from django.core.exceptions import ValidationError


class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)

    def __str__(self):
        return self.username

    @property
    def profile(self):
        return Profile.objects.get(user=self)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(
        upload_to="profile_pictures/", null=True, blank=True, default="default.png"
    )
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    language = models.CharField(max_length=10, null=True, blank=True)
    bio = models.TextField(default="No bio provided", null=True, blank=True)
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0)
    win_streak = models.IntegerField(default=0)
    login_mode = models.CharField(max_length=20, default="intra")

    is_2fa_enabled = models.BooleanField(default=False)
    weekly_results = models.JSONField(default=list)

    def gainPoints(self, points):
        self.points += points
        trashHold = (2**self.level) * 10
        if self.points >= trashHold:
            self.level += 1
            self.points = self.points % trashHold
        self.save()

    def __str__(self):
        return self.user.username


class Friend(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_BLOCKED = "blocked"

    STATUS = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_BLOCKED, "Blocked"),
    ]

    user = models.ForeignKey(User, related_name="friend_user", on_delete=models.CASCADE)
    friend = models.ForeignKey(
        User, related_name="friend_friend", on_delete=models.CASCADE
    )
    status = models.CharField(max_length=10, choices=STATUS, default=STATUS_PENDING)

    def __str__(self):
        return f"{self.user.username} is friends with {self.friend.username}"


class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_of")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "friend")

    def __str__(self):
        return f"{self.user} is friends with {self.friend}"

class GameInvitation(models.Model):

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="game_invitations_sent")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="game_invitations_received")
    game_mode = models.CharField(max_length=20 , default="ping-pong")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game invitation from {self.from_user} to {self.to_user}"
    @property
    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)
    



class Tournament(models.Model):
    name = models.CharField(max_length=100, unique=True)
    max_players = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_tournaments')

    def clean(self):
        # Ensure that max_players is one of the allowed values (4, 8, or 16)
        if self.max_players not in [4, 8, 16]:
            raise ValidationError("Tournament must have 4, 8, or 16 players.")

    def save(self, *args, **kwargs):
        # Call clean() method to validate before saving
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class Participant(models.Model):
    user = models.ForeignKey('my_shared_models.User', on_delete=models.CASCADE, default = 1)
    tournament = models.ForeignKey(Tournament, related_name='participants', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} in {self.tournament.name}"
