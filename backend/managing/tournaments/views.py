# tournaments/views.py
from django.shortcuts import render, redirect
import random
from collections import defaultdict
from django.utils.timezone import now
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest
from my_shared_models.models import Tournament, Participant, User
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import TournamentSerializer, ParticipantSerializer
from Mapp.serializers import GameSerializer
from Mapp.models import Game
from my_shared_models.serializers import UserSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_tournament(request):
    # Create a mutable copy of the request data
    data = request.data.copy()

    # Check if a tournament with the same name already exists
    name = data.get("name")
    if Tournament.objects.filter(name=name).exists():
        return Response(
            {"error": "A tournament with this name already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Pass the data to the serializer
    serializer = TournamentSerializer(data=data)
    if serializer.is_valid():
        # Save the tournament with the current user as the owner
        serializer.save(owner=request.user)
        return Response(
            {"message": "Tournament created successfully"},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_tournament(request):
    tournament_id = request.data.get("tournament_id")

    # Check that tournament exists and is active
    try:
        tournament = Tournament.objects.get(id=tournament_id, is_active=True)

    except Tournament.DoesNotExist:
        return Response(
            {"error": "Invalid tournament selection."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if tournament is full
    if tournament.participants.count() >= tournament.max_players:
        return Response(
            {"error": "This tournament is already full."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if user is already a participant
    if Participant.objects.filter(user=request.user, tournament=tournament).exists():
        return Response(
            {"error": "You are already registered in this tournament."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create new participant
    participant = Participant.objects.create(user=request.user, tournament=tournament)

    return Response(
        {"message": "Successfully joined tournament"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tournament_list(request):
    tournaments = Tournament.objects.all()
    serializer = TournamentSerializer(tournaments, many=True, context={'user': request.user})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def is_participant_allowed(request, match_id):
  

    game = Game.objects.select_related("tournament").get(id=match_id)
    tournament = game.tournament
    user = request.user.id

    is_authorized = (
        game and 
        tournament.participants.filter(tournament_id=tournament.id, user_id=user).exists() and 
        game.status != Game.STATUS_COMPLETED
    )

    return Response(
        {"authorized": is_authorized}, 
        status=status.HTTP_200_OK if is_authorized else status.HTTP_401_UNAUTHORIZED
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_tournament(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)

    participants = list(tournament.participants.all())
    if len(participants) != tournament.max_players:
        return Response(
            {"error": "Number of participants must equal max_players."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if Round 1 matches exist
    if Game.objects.filter(tournament=tournament, round=1).exists():
        return Response(
            {"error": "First round matches already exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Shuffle and create matches
    random.shuffle(participants)
    created_matches = []

    for i in range(0, len(participants), 2):
        match = Game.objects.create(
            tournament=tournament,
            player_one=participants[i].user,
            player_two=participants[i + 1].user,
            round=1,
            status=Game.STATUS_PENDING,
            score={
                "player1": 0,
                "player2": 0,
            },
            duration=timedelta(seconds=0),

        )
        created_matches.append(
            {
                "match_id": match.id,
                "player1": participants[i].user.username,
                "player2": participants[i + 1].user.username,
            }
        )

    return Response(
        {"message": "Tournament started successfully", "matches": created_matches},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lobby(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
    except Tournament.DoesNotExist:
        return Response(
            {"error": "Tournament does not exist."}, status=status.HTTP_404_NOT_FOUND
        )

    participants = tournament.participants.all()

    return Response(
        {
            "tournament": TournamentSerializer(tournament).data,
            "participants": ParticipantSerializer(participants, many=True).data,
            "ready_to_start": len(participants) == tournament.max_players,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_match(request):
    tournament_id = request.data.get("tournament")
    player1_id = request.data.get("player1")
    player2_id = request.data.get("player2")
    match_time = request.data.get("match_time")

    try:
        tournament = Tournament.objects.get(id=tournament_id)
        player1 = Participant.objects.get(id=player1_id, tournament=tournament)
        player2 = Participant.objects.get(id=player2_id, tournament=tournament)
    except (Tournament.DoesNotExist, Participant.DoesNotExist):
        return Response(
            {"error": "Invalid tournament or participants selected."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    match = Game.objects.create(
        tournament=tournament, player_one=player1.user, player_two=player2.user, date_played=match_time
    )

    return Response(
        {"message": "Match created successfully"}, status=status.HTTP_200_OK
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_match(request, match_id):
    match = get_object_or_404(Game, id=match_id)
    
    # if match.status != Game.STATUS_PENDING:
    #     return Response(
    #         {"error": "Match has already started or completed."},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )
    
    # Mark the match as ongoing
 

    return Response({
        "message": "Match started successfully",
        "match_id": match.id,
        "player1": {
            "id": match.player_one.id,
            "username": match.player_one.username,
        },
        "player2": {
            "id": match.player_two.id,
            "username": match.player_two.username,
        },
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    
    matches = Game.objects.filter(tournament=tournament).order_by(
        "round", "date_played"
    )
    # if not matches:

    participants = tournament.participants.all()
    # Group matches by round
    rounds_dict = defaultdict(list)
    for match in matches:
        # Add player data with display_name
        rounds_dict[match.round].append({
            "id": match.id,
            "player_one": {
                "id": match.player_one.id,
                "username": match.player_one.username,
                "display_name": match.player_one.profile.display_name or match.player_one.username,
                "avatar": match.player_one.profile.avatar.url if match.player_one.profile.avatar else None,
            },
            "player_two": {
                "id": match.player_two.id,
                "username": match.player_two.username,
                "display_name": match.player_two.profile.display_name or match.player_two.username,
                "avatar": match.player_two.profile.avatar.url if match.player_two.profile.avatar else None,
            },
            "status": match.status,
            "winner": match.winner.id if match.winner else None,
        })
    last_round = max(rounds_dict.keys()) if rounds_dict else None
    winner = None
    is_completed = False

    if last_round is not None:

        matches_in_last_round = rounds_dict[last_round]

        if len(matches_in_last_round) == 1:
            last_match_in_round = matches_in_last_round[0]
            
            is_completed = last_match_in_round['status'] == Game.STATUS_COMPLETED

            if is_completed:
                winner_id = last_match_in_round['winner']
                print(f"winner: {winner_id}")

                winner = get_object_or_404(Participant, user_id=winner_id, tournament=tournament)

    return Response(
        {
            "tournament": TournamentSerializer(tournament).data,
            "participants": ParticipantSerializer(participants, many=True).data,
            "rounds": dict(rounds_dict),
            "is_completed": is_completed,
            "winner": ParticipantSerializer(winner).data if winner else None,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_match(request, match_id):
    match = get_object_or_404(Game, id=match_id)

    if match.status != Game.STATUS_PENDING:
        return Response(
            {"error": "Match is already completed."}, status=status.HTTP_400_BAD_REQUEST
        )

    # winner = match.player1
    winner_id = request.data.get("winner_id")
    winner = get_object_or_404(Participant, id=winner_id, tournament=match.tournament)

    match.status = "completed"
    match.winner = winner
    match.save()

    tournament = match.tournament
    current_round = match.round

    winners = []

    current_round_matches = tournament.matches.filter(
        round=current_round, status=Game.STATUS_PENDING
    )
    created_matches = [] 

    if not current_round_matches.exists():
        completed_matches = tournament.matches.filter(
            round=current_round, status="completed"
        )
        winners = [m.winner for m in completed_matches]

        if len(winners) > 1:
            next_round = current_round + 1
            for i in range(0, len(winners), 2):
                if i + 1 < len(winners):
                    Game.objects.create(
                        tournament=tournament,
                        player_one=winners[i],
                        player_two=winners[i + 1],
                        round=next_round,
                        status= Game.STATUS_PENDING,
                )
                # created_matches.append(MatchSerializer(new_match).data)

    response_data = {
        "message": "Match completed successfully",
        "winner": ParticipantSerializer(winner).data,
    }
    
    if created_matches:
        response_data["new_matches"] = created_matches
    elif len(winners) == 1:
        response_data["tournament_winner"] = ParticipantSerializer(winners[0]).data

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_match_details(request, match_id):
    match = get_object_or_404(Game, id=match_id)
    return Response({
        "id": match.id,
        "tournament": match.tournament.name,
        "round": match.round,
        "player1": ParticipantSerializer(match.player_one).data,
        "player2": ParticipantSerializer(match.player_two).data,
        "status": match.status,
    })


