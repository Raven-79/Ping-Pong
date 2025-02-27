import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from my_shared_models.models import Tournament, Participant
from Mapp.models import Game
from Mapp.serializers import GameSerializer
from tournaments.serializers import ParticipantSerializer, TournamentSerializer
from collections import defaultdict
from django.utils.timezone import now
from datetime import timedelta
from django.shortcuts import get_object_or_404



tournament_players = {}

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Tournament WebSocket connected")
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            print("[CONNECT] WebSocket connection rejected: User not authenticated.")
            await self.close()
            return 

        await self.accept()        



    async def disconnect(self, close_code):
        tournament_id = await self.get_tournament_for_user(self.user)

        if tournament_id:
            if tournament_id in tournament_players:
                tournament_players[tournament_id]['players'] = [
                    player for player in tournament_players[tournament_id]['players']
                    if player[0] != self.channel_name 
                ]
                

                if not tournament_players[tournament_id]['players']:
                    del tournament_players[tournament_id]['players']


            tournament_name = await self.get_tournament_name(tournament_id)

            # if tournament_name: 
            #     await self.send_player_list_to_lobby(tournament_name, tournament_id)

        print(f"[DISCONNECT] Player {self.user.username} disconnected from tournament {tournament_id}")

        await self.channel_layer.group_discard(
            tournament_name, 
            self.channel_name 
        )


    async def receive(self, text_data):
        try:
            if not self.user.is_authenticated:
                await self.send(
                    text_data=json.dumps(
                        {"type": "error", "message": "You are not authenticated."}
                    )
                )
                return

            data = json.loads(text_data)
            event_type = data.get("type")


            self.tournament_id = int(data.get("tournament_id"))
            if (not self.tournament_id):
                self.close()
                return
            tournament = await self.get_tournament_by_id(self.tournament_id)

            participant = await self.get_participant(tournament.id, self.user.id)

            if not participant or not tournament:
                await self.send(
                    text_data=json.dumps(
                        {"type": "not_allowed", "message": "You are not a participant in this tournament."}
                    )
                )
                return


            if event_type == "view_tournament":

                self.tournament_name = tournament.name

                if self.tournament_id not in tournament_players:
                    tournament_players[self.tournament_id] = {'players': [], 'is_full': False}  # Initialize tournament structure


                if not any(player[0] == self.user for player in tournament_players[self.tournament_id]['players']):
                    tournament_players[self.tournament_id]['players'].append([self.user, self.channel_name])
                else:
                    print(f"[INFO] User {self.user.username} is already save.")


                await self.channel_layer.group_add(
                    self.tournament_name,  
                    self.channel_name
                )
                                    
                if not tournament_players[self.tournament_id]['is_full']:
                    print("is_full: false")
                    await self.send_player_list_to_lobby(self.tournament_name, self.tournament_id)
                else:
                    print("is_full: true")
                    
                
                if len(tournament_players[self.tournament_id]) == 4 and not tournament_players[self.tournament_id]['is_full']:
                    tournament_players[self.tournament_id]['is_full'] = True

            elif event_type == "user_join_rounds":
                data = await self.get_rounds(tournament)
                await self.channel_layer.group_send(
                    tournament.name,
                    data
                )
            elif event_type == "update_display_name":
                # Refresh participant list
                await self.send_player_list_to_lobby(self.tournament_name, self.tournament_id)



        except json.JSONDecodeError as e:
            # If the message is not valid JSON, send an error response
            print(f"Error parsing JSON: {e}")
            await self.send(text_data=json.dumps({
                "error": "Invalid data format. Could not parse the message."
            }))
            await self.close()

    async def send_player_list_to_lobby(self, tournament_name, tournament_id):

        formatted_participants = await self.get_users_for_tournament(tournament_id)


        await self.channel_layer.group_send(
            tournament_name,
            {
                "type": "participant_list",
                "player_list": formatted_participants
            }
        )

    async def participant_list(self, event):
        player_list = event["player_list"]
        await self.send(text_data=json.dumps({"player_list": player_list, "type": "participant_list"}))


    @database_sync_to_async
    def get_tournament_for_user(self, user):
        for tournament_id, data in tournament_players.items():
            for player in data['players']:
                if player[0] == user:  # Check the user in the first position of the list
                    return tournament_id
        return None

    @database_sync_to_async
    def get_tournament_name(self, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            return tournament.name
        except Tournament.DoesNotExist:
            return None

    @database_sync_to_async
    def get_tournament_by_id(self, tournament_id):
        return Tournament.objects.get(id=tournament_id) 
    
    @database_sync_to_async
    def get_participant(self, tournament_id, user_id):
        try:
            return Participant.objects.get(tournament_id=tournament_id, user_id=user_id)
        except Participant.DoesNotExist:
            return None  


    # doing this instead of fetching the participants by user id + tourn then serialize 
    @database_sync_to_async
    def get_users_for_tournament(self, tournament_id):
        participants = Participant.objects.filter(tournament_id=tournament_id).select_related('user__profile')
        return [
            {
                "id": participant.id,
                "user": {
                    "id": participant.user.id,
                    "username": participant.user.username,
                    "display_name": participant.user.profile.display_name if participant.user.profile.display_name else "Unknown Player",
                    "avatar": participant.user.profile.avatar.url if participant.user.profile.avatar else "/media/default-avatar.png",
                },
            }
            for participant in participants
        ]

        
    @database_sync_to_async

    def get_rounds(self, tournament):
        matches = Game.objects.filter(tournament=tournament).order_by("round", "date_played")
        rounds_dict = defaultdict(list)
        for match in matches:
            rounds_dict[match.round].append({
                "id": match.id,
                "player_one": {
                    "id": match.player_one.id,
                    "username": match.player_one.username,
                    "display_name": match.player_one.profile.display_name or match.player_one.username,
                },
                "player_two": {
                    "id": match.player_two.id,
                    "username": match.player_two.username,
                    "display_name": match.player_two.profile.display_name or match.player_two.username,
                },
                "status": match.status,
                "winner": match.winner.id if match.winner else None,
            })

        return {"type": "rounds_update", "rounds": dict(rounds_dict)}

            

    async def rounds_update(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "rounds_update",
                "rounds": event["rounds"],
            })
        )

        
