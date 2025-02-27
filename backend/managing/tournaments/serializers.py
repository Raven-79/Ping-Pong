from rest_framework import serializers
from my_shared_models.models import Tournament, Participant

class TournamentSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    owner_avatar = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    has_joined = serializers.SerializerMethodField()
    
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'max_players', 'is_active','owner', 'owner_name', 'owner_avatar', 'participants_count', 'has_joined']
        read_only_fields = ['owner'] # Prevent owner from being modified

    def validate_max_players(self, value):
        if value not in [4, 8, 16]:
            raise serializers.ValidationError("Tournament must have 4, 8, or 16 players.")
        return value
    def get_owner_avatar(self, obj):
        try:
            return obj.owner.profile.avatar.url  # Access the avatar via the related Profile
        except AttributeError:
            return "/media/profile_pictures/default-avatar.png"  # Default avatar path
    def get_participants_count(self, obj):
        # Calculate the number of participants dynamically
        return obj.participants.count()
    
    def get_has_joined(self, obj):
        user = self.context.get('user') # Access the user from the request context
        return obj.participants.filter(user=user).exists() 

class ParticipantSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Participant
        fields = ['id', 'user']
    
    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,  # You can keep this for fallback or debugging
            "display_name": obj.user.profile.display_name if hasattr(obj.user, 'profile') else "Unknown Player",
            "avatar": obj.user.profile.avatar.url if hasattr(obj.user, 'profile') and obj.user.profile.avatar else "/media/default-avatar.png",
        }
