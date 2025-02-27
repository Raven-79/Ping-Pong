# tournaments/forms.py
from django import forms
from my_shared_models.models import Tournament, Participant

class TournamentForm(forms.ModelForm):
    max_players = forms.ChoiceField(
        choices=[(4, "4 Players"), (8, "8 Players"), (16, "16 Players")],
        label="Select Number of Players"
    )

    class Meta:
        model = Tournament
        fields = ['name', 'max_players']

class ParticipantForm(forms.ModelForm):
    class Meta:
        model = Participant
        fields = ['alias', 'tournament']

