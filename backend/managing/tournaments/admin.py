from django.contrib import admin
from my_shared_models.models import Tournament, Participant


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_players', 'is_active', 'created_at', 'owner')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'tournament')  # Add `display_name`
    search_fields = ('user__username', 'user__profile__display_name', 'tournament__name')  # Add `display_name` to search

    def display_name(self, obj):
        return obj.user.profile.display_name or "Unknown Player"
    display_name.short_description = 'Display Name'  # Label for the column