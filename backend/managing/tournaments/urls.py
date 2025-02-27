from django.urls import path
from .views import create_tournament, join_tournament, create_match, tournament_list, is_participant_allowed
from .views import start_tournament, lobby, complete_match, matches, start_match, get_match_details

urlpatterns = [
    path('tournament/create/', create_tournament, name='create_tournament'),
    path('tournament/join/', join_tournament, name='join_tournament'),
    path('match/create/', create_match, name='create_match'),
    path('tournament/list/', tournament_list, name='tournament_list'), 
    path('tournament/<int:tournament_id>/lobby/', lobby, name='lobby'),
    path('tournament/<int:tournament_id>/start/', start_tournament, name='start_tournament'),
    path('tournament/game/<int:match_id>/auth', is_participant_allowed, name='is_participant_allowed'),
    path('match/<int:match_id>/complete/', complete_match, name='complete_match'),
    path('tournament/<int:tournament_id>/matches/', matches, name='matches'),
    path('match/<int:match_id>/start/', start_match, name='start_match'),
    path('match/<int:match_id>/', get_match_details, name='get_match_details'),


]
