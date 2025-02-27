from django.db import models


# Create your models here.
from my_shared_models.models import User, Tournament

class Game(models.Model):

    STATUS_PENDING = "pending"
    STATUS_ONGOING = "Ongoing"
    STATUS_COMPLETED = "Completed"

    STATUS = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ONGOING, "Ongoing"),
        (STATUS_COMPLETED, "Completed"),
    ]

    player_one = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="games_as_player_one"
    )
    player_two = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="games_as_player_two"
    )
    winner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won"
    )
    score = models.JSONField()
    date_played = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField()
    game_mode = models.CharField(max_length=20)
    tournament = models.ForeignKey(Tournament, null=True, on_delete=models.SET_NULL, blank=True, default=None, related_name="games")

    round = models.IntegerField(default=1) 
    status = models.CharField(max_length=10, choices=STATUS, default=STATUS_PENDING)

    def __str__(self):
        return f"Game {self.id} - {self.player_one} vs {self.player_two}"

    class Meta:
            app_label = 'Mapp' 