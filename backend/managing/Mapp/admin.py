from django.contrib import admin

# Register your models here.
from my_shared_models.models import Profile, Friend, User
from .models import Game

# Admin for Profile
class ProfileAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['user','first_name', 'avatar', 'points', 'id']}),
    ]
    list_display = ('user', 'first_name', 'points', 'id')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)

# Admin for Friend
class FriendAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['user', 'friend', 'status']}),
    ]
    list_display = ('user', 'friend', 'status')
    search_fields = ('user__username', 'friend__username', 'status')


# Admin for Game
class GameAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['player_one', 'player_two', 'winner', 'score', 'duration', 'game_mode', 'status']}),
    ]
    list_display = ('player_one', 'player_two', 'winner', 'score_one', 'score_two', 'game_mode', 'duration', 'status')
    search_fields = ('player_one__username', 'player_two__username', 'winner__username', 'game_mode')

    def score_one(self, obj):
        # Extract 'score_one' from the 'score' JSONField
        return obj.score.get('playerFront', 'N/A')
    score_one.short_description = "Player One Score"

    def score_two(self, obj):
        # Extract 'score_two' from the 'score' JSONField
        return obj.score.get('playerBack', 'N/A')
    score_two.short_description = "Player Two Score"


# Admin for User
class CustomUserAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser']}),
    ]
    list_display = ('id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('username',)

# Register the models
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Friend, FriendAdmin)
admin.site.register(Game, GameAdmin)
admin.site.register(User, CustomUserAdmin)
