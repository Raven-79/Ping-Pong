import asyncio
import json
import random
import time
from django.utils import timezone
from my_shared_models.serializers import PlayerSerializer
from my_shared_models.models import GameInvitation, Participant
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import timedelta
from django.shortcuts import get_object_or_404

from collections import defaultdict
from asgiref.sync import sync_to_async
from datetime import timedelta
from django.utils import timezone


from managing.Mapp.models import Game
import logging

logger = logging.getLogger(__name__)


WIDTH = 1600
HEIGHT = 900
PADDLE_WIDTH = 3
PADDLE_HEIGHT = 1
BALL_RADIUS = 1
FPS = 60
MAX_POINTS = 5


class PlayerConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous or not self.user.is_authenticated:
            await self.close()
            return
        self.receive_handler = self.handle_player
        self.disconnect_handler = self.handle_player_disconnect
        await self.accept()
        # GameQueueManager.add_to_queue(self)

    async def disconnect(self, close_code):
        await self.disconnect_handler(player=self)

    async def receive(self, text_data=None):
        data = json.loads(text_data)
        await self.receive_handler(data, player=self)

    async def handle_player(self, data, **kwargs):
        if data.get("type") == "join_queue":
            GameQueueManager.add_to_queue(self)
        elif data.get("type") == "join_by_invite":
            invite_id = data.get("inviteId")
            if invite_id:
                await InviteGameManager.add_to_invite_queue(self, invite_id)
            else:
                await self.send(
                    json.dumps({"type": "invite_error", "message": "Invalid invite ID"})
                )
        elif data.get("type") == "join_tour_game":
            game_id = data.get("gameId")
            result = await TournamentGameManager.validate_and_add_to_game(self, game_id)
            print(result)
            if not result.get("success"):
                print("failure")
                print(result)
                print(result)
                await self.send(
                    json.dumps(
                        {
                            "type": "game_error",
                            "error_type": result.get("type"),  # Include error key
                            "message": result.get("error"),  # Error message
                        }
                    )
                )
            else:
                # Handle success, proceed with game logic
                print("successssss")

    async def handle_player_disconnect(self, player):
        # if hasattr(self, "game"):is_authorized
        #     await self.game.handle_player_disconnect(self)
        # else:
        #     GameQueueManager.remove_from_queue(self)
        #     InviteGameManager.remove_from_invite_queue(self)
        pass


class TournamentGameManager:
    # A map to keep track of pending validations for tournament games
    pending_validations = defaultdict(list)

    @classmethod
    @sync_to_async
    def get_game_and_tournament(cls, game_id):
        try:
            game = Game.objects.select_related("tournament").get(id=game_id)
            tournament = game.tournament  # Access the related tournament
            return game, tournament
        except Game.DoesNotExist:
            return None, None

    @classmethod
    @database_sync_to_async
    def update_game_status(cls, game, status):
        game.status = status
        game.save()

    @classmethod
    async def validate_and_add_to_game(cls, player, game_id):
        """
        Validate the user for a tournament game and add them to the pending validations map.
        """
        game, tournament = await cls.get_game_and_tournament(game_id)
        print("end")
        if not game:
            # Emit error if game is invalid
            return {
                "success": False,
                "type": "invalid_game_id",
                "error": "Invalid game ID",
            }

        if not tournament:
            return {
                "success": False,
                "type": "no_tournament",
                "error": "Game is not part of a tournament",
            }

        is_autorized = await cls.is_authorized(player.user, tournament, game)

        if not is_autorized:
            return {
                "success": False,
                "type": "unauthorized",
                "error": "player.user not authorized for this tournament",
            }

        if player not in cls.pending_validations[game.id]:
            cls.pending_validations[game.id].append(player)

        if len(cls.pending_validations[game.id]) == 2:
            await cls.start_tournament_game(game, tournament)

        return {"success": True, "message": "Game over", "type": ""}

    @classmethod
    @sync_to_async
    def is_authorized(cls, user_id, tournament, game):
        """
        Check if a user is part of the tournament.
        """
        tr = tournament.participants.filter(user_id=user_id).exists()
        gameFinished = game.status == Game.STATUS_COMPLETED

        # return tournament and not gameFinished

        if tr:
            return not gameFinished
        return False

    @classmethod
    async def start_tournament_game(cls, game, tournament):
        """
        Start the game once both players are validated.
        """
        print("A SAEF GAME START")
        print()
        if (
            game.id not in cls.pending_validations
            or len(cls.pending_validations[game.id]) < 2
        ):
            return

        player1, player2 = cls.pending_validations.pop(game.id)

        print("BEFORE GAME START")

        game_state = GameState(player1, player2, game.id, tournament_id=tournament.id)
        print("GAME START")
        await cls.update_game_status(game, Game.STATUS_ONGOING)
        await game_state.start()
        await cls.update_game_status(game, Game.STATUS_COMPLETED)


class InviteGameManager:
    pending_invites = {}

    @classmethod
    @database_sync_to_async
    def get_invitation(cls, invite_id):
        return (
            GameInvitation.objects.select_related("from_user", "to_user")
            .filter(id=invite_id)
            .first()
        )

    @classmethod
    async def add_to_invite_queue(cls, player, invite_id):
        player.receive_handler = cls.handle_invited_player
        player.disconnect_handler = cls.remove_from_invite_queue
        invitation = await cls.get_invitation(invite_id)

        if not invitation:

            await player.send(
                json.dumps(
                    {
                        "type": "invite_error",
                        "message": "Invalid invite ID",
                    }
                )
            )
            return
        if invitation.is_expired:
            await player.send(
                json.dumps(
                    {
                        "type": "invite_error",
                        "message": "Invite has expired",
                    }
                )
            )
            return
        if invitation.to_user != player.user and invitation.from_user != player.user:
            await player.send(
                json.dumps(
                    {
                        "type": "invite_error",
                        "message": "You are not the intended recipient of this invite",
                    }
                )
            )
            return
        if invite_id in cls.pending_invites:
            print(
                "invite_id in cls.pending_invites",
                player.user in cls.pending_invites[invite_id],
                flush=True,
            )
            print(
                "cls.pending_invites[invite_id]",
                cls.pending_invites[invite_id],
                flush=True,
            )
            print("player.user", player.user, flush=True)
            if player.user == cls.pending_invites[invite_id][0].user:
                await player.send(
                    json.dumps(
                        {
                            "type": "invite_error",
                            "message": "You are already in the queue",
                        }
                    )
                )
                return

            cls.pending_invites[invite_id].append(player)
        else:
            cls.pending_invites[invite_id] = [player]
        await cls.start_invited_game(invitation)

    @classmethod
    async def remove_from_invite_queue(cls, player):
        for invite_id, players in list(cls.pending_invites.items()):
            if player.user == players[0].user or player.user == players[1].user:
                players.remove(player)
                if not players:
                    del cls.pending_invites[invite_id]
                else:

                    remaining_player = players[0]
                    await remaining_player.send(
                        json.dumps(
                            {
                                "type": "invite_cancelled",
                                "message": "Other player left the queue",
                            }
                        )
                    )

                    cls.pending_invites.pop(invite_id, None)

    @classmethod
    @database_sync_to_async
    def update_invitation(cls, invitation):
        invitation.save()

    @classmethod
    async def start_invited_game(cls, invitation):
        invite_id = str(invitation.id)
        if (
            invite_id in cls.pending_invites
            and len(cls.pending_invites[invite_id]) == 2
        ):
            player1, player2 = cls.pending_invites[invite_id]

            game = GameState(player1, player2)
            del cls.pending_invites[invite_id]
            invitation.created_at = timezone.now() - timedelta(minutes=10)
            await cls.update_invitation(invitation)
            await game.start()

    @classmethod
    async def handle_invited_player(cls, data, **kwargs):
        pass


class GameQueueManager:
    queue = []

    @classmethod
    def add_to_queue(cls, player):
        for user in cls.queue:
            if user.user == player.user:
                return
        if player not in cls.queue:
            cls.queue.append(player)
            player.receive_handler = cls.handle_player
            player.disconnect_handler = cls.remove_from_queue
            asyncio.create_task(cls.check_queue())

    @classmethod
    async def remove_from_queue(cls, player):
        if player in cls.queue:
            cls.queue.remove(player)

    @classmethod
    async def check_queue(cls):
        if len(cls.queue) >= 2:
            playerFront = cls.queue.pop(0)
            playerBack = cls.queue.pop(0)
            game = GameState(playerFront, playerBack)
            await game.start()

    @classmethod
    async def handle_player(cls, data, **kwargs):
        pass


class GameState:

    def __init__(self, playerFront, playerBack, game_id=None, tournament_id=None):
        self.playerBack = playerBack
        self.playerFront = playerFront
        self.playerBack.receive_handler = self.handle_player_input
        self.playerFront.receive_handler = self.handle_player_input
        self.playerBack.disconnect_handler = self.handle_player_disconnect
        self.playerFront.disconnect_handler = self.handle_player_disconnect
        self.playerBackScore = 0
        self.current_player = self.playerBack
        self.GAME_SPEED = 0.5
        self.game_id = game_id
        self.tournament_id = tournament_id
        self.init_game_state()

    def init_game_state(self):
        # Player 1 paddle (left)
        self.paddleBack = {
            "dx": 0,
            "x": 0,
            "z": -25,
            "width": PADDLE_WIDTH,
            "height": PADDLE_HEIGHT,
            "isReady": False,
        }

        # Player 2 paddle (right)
        self.paddleFront = {
            "dx": 0,
            "x": 0,
            "z": 25,
            "width": PADDLE_WIDTH,
            "height": PADDLE_HEIGHT,
            "isReady": False,
        }

        # Ball
        self.ball = {
            "x": 0,
            "z": 0,
            "dx": random.choice([-1, 1]) * self.GAME_SPEED,
            "dz": random.choice([-1, 1]) * self.GAME_SPEED,
            "radius": BALL_RADIUS,
        }

        self.scores = {"playerFront": 0, "playerBack": 0}
        self.scoresToStore = {"player1": 0, "player2": 0}
        self.sound = ""
        self.running = True

    async def start(self):
        self.playerBack.game = self
        self.playerFront.game = self
        # send enimies
        await self.send_initial_state()
        asyncio.create_task(self.game_loop())

    @database_sync_to_async
    def set_players_data(self):
        self.playerBackData = PlayerSerializer(self.playerBack.user.profile).data
        self.playerFrontData = PlayerSerializer(self.playerFront.user.profile).data

    async def send_initial_state(self):
        await self.set_players_data()

        initial_state = {
            "type": "game_start",
            "ball": self.ball,
            "paddleBack": self.paddleBack,
            "paddleFront": self.paddleFront,
            "player_side": "right",
            "playerBackData": self.playerBackData,
            "playerFrontData": self.playerFrontData,
            "scores": self.scores,
        }
        await self.playerFront.send(json.dumps(initial_state))

        initial_state["player_side"] = "left"
        initial_state["paddleBack"] = self.paddleFront
        initial_state["paddleFront"] = self.paddleBack
        initial_state["scores"] = {
            "playerFront": self.scores["playerBack"],
            "playerBack": self.scores["playerFront"],
        }
        initial_state["playerBackData"] = self.playerFrontData
        initial_state["playerFrontData"] = self.playerBackData
        await self.playerBack.send(json.dumps(initial_state))

    def update_paddles(self):
        if (
            self.paddleBack["dx"] != 0
            and -17 + self.paddleBack["width"]
            <= self.paddleBack["x"] + self.paddleBack["dx"]
            <= 17 - self.paddleBack["width"]
        ):
            self.paddleBack["x"] += self.paddleBack["dx"]
        elif self.paddleBack["dx"] < 0:
            self.paddleBack["x"] = -17 + self.paddleBack["width"]
        elif self.paddleBack["dx"] > 0:
            self.paddleBack["x"] = 17 - self.paddleBack["width"]

        if (
            self.paddleFront["dx"] != 0
            and -17 + self.paddleFront["width"]
            <= self.paddleFront["x"] + self.paddleFront["dx"]
            <= 17 - self.paddleFront["width"]
        ):
            self.paddleFront["x"] += self.paddleFront["dx"]
        elif self.paddleFront["dx"] < 0:
            self.paddleFront["x"] = -17 + self.paddleFront["width"]
        elif self.paddleFront["dx"] > 0:
            self.paddleFront["x"] = 17 - self.paddleFront["width"]

    def update_ball(self):
        self.ball["x"] += self.ball["dx"]
        self.ball["z"] += self.ball["dz"]

        if (
            self.ball["x"] + self.ball["dx"] <= -16.6
            or self.ball["x"] + self.ball["dx"] >= 16.6
        ):
            self.ball["dx"] *= -1
            self.sound = "wall"
            self.updateSpeed(0.02)
        else:
            self.sound = ""

        if self.ball["z"] <= -26:
            self.scores["playerFront"] += 1
            self.reset_ball()
            self.sound = "goal"
        elif self.ball["z"] >= 26:
            self.scores["playerBack"] += 1
            self.reset_ball()
            self.sound = "goal"
        elif (
            self.ball["z"] > 0
            and self.ball["z"] < self.paddleFront["z"]
            and abs(self.ball["z"] - self.paddleFront["z"]) < 1.25
            and abs(self.ball["x"] - self.paddleFront["x"]) < 3.75
        ):
            self.ball["z"] -= 1.26 - abs(self.ball["z"] - self.paddleFront["z"])
            self.ball["dz"] *= -1
            distanceX = abs(self.paddleFront["x"] - self.ball["x"])
            dx_sign = 1 if self.ball["x"] > self.paddleFront["x"] else -1
            if distanceX <= (3):
                self.ball["dx"] = distanceX * 0.5 * self.GAME_SPEED * dx_sign
            if (
                self.ball["x"] + self.ball["dx"] <= -16.6
                or self.ball["x"] + self.ball["dx"] >= 16.6
            ):
                self.ball["dx"] *= -1
            self.updateSpeed(0.05)
            self.sound = "paddle"

        elif (
            self.ball["z"] < 0
            and self.ball["z"] > self.paddleBack["z"]
            and abs(self.ball["z"] - self.paddleBack["z"]) < 1.25
            and abs(self.ball["x"] - self.paddleBack["x"]) < 3.75
        ):
            self.ball["z"] += 1.26 - abs(self.ball["z"] - self.paddleBack["z"])
            self.ball["dz"] *= -1
            distanceX = abs(self.paddleBack["x"] - self.ball["x"])
            dx_sign = -1 if self.ball["x"] < self.paddleBack["x"] else 1
            if distanceX <= (3):
                self.ball["dx"] = distanceX * 0.5 * self.GAME_SPEED * dx_sign
            if (
                self.ball["x"] + self.ball["dx"] <= -16.6
                or self.ball["x"] + self.ball["dx"] >= 16.6
            ):
                self.ball["dx"] *= -1
            self.updateSpeed(0.05)
            self.sound = "paddle"
        elif self.sound != "wall":
            self.sound = ""

    def reset_ball(self):
        self.GAME_SPEED = 0.5
        self.ball["x"] = 0
        self.ball["z"] = 0
        self.ball["dx"] = random.choice([-1, 1]) * self.GAME_SPEED
        dz_sign = 1 if self.ball["dz"] > 0 else -1
        self.ball["dz"] = dz_sign * self.GAME_SPEED

    async def send_game_state(self, game_state):
        await self.playerFront.send(json.dumps(game_state))
        await self.playerBack.send(json.dumps(self.flip_state(game_state)))

    def flip_state(self, state):
        new_state = {}
        for key, value in state.items():
            if key == "paddleBack":
                new_state["paddleBack"] = {
                    "x": self.paddleFront["x"] * -1,
                }
            elif key == "paddleFront":
                new_state["paddleFront"] = {
                    "x": self.paddleBack["x"] * -1,
                }
            elif key == "ball":
                new_state["ball"] = {
                    "x": value["x"] * -1,
                    "z": value["z"] * -1,
                    "dx": -value["dx"],
                    "dz": -value["dz"],
                    "radius": value["radius"],
                }
            elif key == "scores":
                new_state["scores"] = {
                    "playerFront": value["playerBack"],
                    "playerBack": value["playerFront"],
                }
            else:
                new_state[key] = value

        return new_state

    async def game_loop(self):
        self.increaseSpeed = False
        self.start_time = timezone.now()
        self.GAME_SPEED = 0.5
        while self.running:
            if (
                self.scores["playerFront"] >= MAX_POINTS
                or self.scores["playerBack"] >= MAX_POINTS
            ):
                self.running = False
                winner = (
                    self.playerFront.user
                    if self.scores["playerFront"] > self.scores["playerBack"]
                    else self.playerBack.user
                )
                await self.send_game_state(
                    {
                        "type": "game_over",
                        "paddleBack": self.paddleBack,
                        "paddleFront": self.paddleFront,
                        "ball": self.ball,
                        "scores": self.scores,
                        "sound": self.sound,
                        "winner": (
                            "right"
                            if self.scores["playerFront"] > self.scores["playerBack"]
                            else "left"
                        ),
                    }
                )
                await self.saveScores()
                if self.game_id is not None:
                    # tournament
                    await self.handle_tournament_games(winner, self.game_id)

                await self.playerFront.close()
                await self.playerBack.close()
                break
            if (
                self.paddleBack["isReady"] == True
                and self.paddleFront["isReady"] == True
            ):
                self.update_paddles()
                self.update_ball()
            game_state = {
                "type": "game_state",
                "paddleBack": self.paddleBack,
                "paddleFront": self.paddleFront,
                "ball": self.ball,
                "scores": self.scores,
                "sound": self.sound,
            }

            await self.send_game_state(game_state)
            await asyncio.sleep(0.03)
            # await asyncio.sleep(1 / FPS)

    def updateSpeed(self, SPEED_INCREMENT):
        MAX_GAME_SPEED = 1.4
        if self.GAME_SPEED < MAX_GAME_SPEED:
            self.GAME_SPEED += SPEED_INCREMENT
            self.GAME_SPEED = min(
                self.GAME_SPEED, MAX_GAME_SPEED
            )  # Ensure it doesn't exceed max

    @database_sync_to_async
    def saveScores(self):
        self.scoresToStore["player2"] = self.scores["playerFront"]
        self.scoresToStore["player1"] = self.scores["playerBack"]

        if self.scores["playerFront"] > self.scores["playerBack"]:
            self.playerFront.user.profile.wins += 1
            self.playerBack.user.profile.losses += 1
            self.playerFront.user.profile.gainPoints(10)
            self.playerBack.user.profile.gainPoints(5)
        else:
            self.playerFront.user.profile.losses += 1
            self.playerBack.user.profile.wins += 1
            self.playerFront.user.profile.gainPoints(5)
            self.playerBack.user.profile.gainPoints(10)

        if self.game_id is not None:
            game = Game.objects.get(id=self.game_id)
            game.player_one = self.playerFront.user
            game.player_two = self.playerBack.user
            game.winner = (
                self.playerFront.user
                if self.scores["playerFront"] > self.scores["playerBack"]
                else self.playerBack.user
            )
            game.score = self.scoresToStore
            game.date_played = timezone.now()
            game.duration = timedelta(seconds=0)
            game.game_mode = "Pong"
            game.save()
            print(f"Game {self.game_id} updated.")
        else:
            game = Game(
                player_one=self.playerFront.user,
                player_two=self.playerBack.user,
                winner=(
                    self.playerFront.user
                    if self.scores["playerFront"] > self.scores["playerBack"]
                    else self.playerBack.user
                ),
                score=self.scoresToStore,
                date_played=timezone.now(),
                duration=timedelta(seconds=0),
                game_mode="Pong",
            )
            game.save()

        self.playerFront.user.profile.total_games += 1
        self.playerBack.user.profile.total_games += 1

        self.playerFront.user.profile.save()
        self.playerBack.user.profile.save()

    async def handle_player_input(self, data, player):
        paddleSpeed = 1.5 * self.GAME_SPEED
        if paddleSpeed > 2:
            paddleSpeed = 2
        paddle = self.paddleBack if player == self.playerBack else self.paddleFront
        if data["type"] == "key_down":
            if data["key"] == "ArrowRight":
                paddle["dx"] = 1 * paddleSpeed
            elif data["key"] == "ArrowLeft":
                paddle["dx"] = -1 * paddleSpeed
        elif data["type"] == "key_up":
            paddle["dx"] = 0
        if player == self.playerBack:
            self.paddleBack["dx"] *= -1
        if (
            data["type"] == "player"
            and data["type"] == "player"
            and data["key"] == "ready"
        ):
            self.paddleBack["isReady"] = True
        if (
            data["type"] == "player"
            and player == self.playerFront
            and data["key"] == "ready"
        ):
            self.paddleFront["isReady"] = True

    async def handle_player_disconnect(self, player):
        if not self.running:
            return
        self.running = False

        other_player = (
            self.playerBack if player == self.playerFront else self.playerFront
        )
        if player == self.playerFront:
            self.scores["playerBack"] = MAX_POINTS
            self.scores["playerFront"] = 0
            winner = self.playerBack.user
        else:
            self.scores["playerFront"] = MAX_POINTS
            self.scores["playerBack"] = 0
            winner = self.playerFront.user

        await self.saveScores()

        # Handle tournament progression if this is a tournament game
        if self.game_id is not None:
            await self.handle_tournament_games(winner, self.game_id)

        await self.send_game_state(
            {
                "type": "game_over",
                "winner": "left" if player == self.playerFront else "right",
                "scores": self.scores,
            }
        )

        # Close connections after handling tournament progression
        await self.playerFront.close()
        await self.playerBack.close()

    @database_sync_to_async
    def handle_tournament_games(self, winner, game_id):
        game = get_object_or_404(Game, id=game_id)

        winner = get_object_or_404(
            Participant, user_id=winner.id, tournament_id=self.tournament_id
        )

        game.status = Game.STATUS_COMPLETED
        game.winner = winner.user
        game.save()

        tournament = game.tournament
        current_round = game.round

        winners = []

        current_round_matches = tournament.games.filter(
            round=current_round, status=Game.STATUS_PENDING
        )
        # created_matches = []

        if not current_round_matches.exists():
            completed_matches = tournament.games.filter(
                round=current_round, status=Game.STATUS_COMPLETED
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
                            status=Game.STATUS_PENDING,
                            score={
                                "player1": 0,
                                "player2": 0,
                            },
                            duration=timedelta(seconds=0),
                        )

        # response_data = {
        #     "message": "Match completed successfully",
        #     "winner": ParticipantSerializer(winner).data,
        # }

        # if created_matches:
        #     response_data["new_matches"] = created_matches
        # elif len(winners) == 1:
        #     response_data["tournament_winner"] = ParticipantSerializer(winners[0]).data


# class TicTacToeQueueManager:
#     queue = []

#     @classmethod
#     def add_to_queue(cls, player):
#         for user in cls.queue:
#             if user.user == player.user:
#                 return
#         if player not in cls.queue:
#             cls.queue.append(player)
#             player.receive_handler = cls.handle_player
#             player.disconnect_handler = cls.remove_from_queue
#             asyncio.create_task(cls.check_queue())

#     @classmethod
#     async def remove_from_queue(cls, player):
#         if player in cls.queue:
#             cls.queue.remove(player)

#     @classmethod
#     async def check_queue(cls):
#         if len(cls.queue) >= 2:
#             player1 = cls.queue.pop(0)
#             player2 = cls.queue.pop(0)
#             game = TicTacToeGameState(player1, player2)
#             await game.start()

#     @classmethod
#     async def handle_player(cls, data, **kwargs):
#         pass


# class TicTacToeGameState:
#     def __init__(self, player1, player2):
#         self.player1 = player1
#         self.player2 = player2
#         self.player1.receive_handler = self.handle_player_input
#         self.player2.receive_handler = self.handle_player_input
#         self.player1.disconnect_handler = self.handle_player_disconnect
#         self.player2.disconnect_handler = self.handle_player_disconnect
#         self.current_player = self.player1
#         self.init_game_state()

#     def init_game_state(self):
#         self.board = [["" for _ in range(3)] for _ in range(3)]
#         self.running = True
#         self.winner = None

#     async def start(self):
#         self.player1.game = self
#         self.player2.game = self
#         await self.send_initial_state()

#     async def send_initial_state(self):
#         initial_state = {
#             "type": "game_start",
#             "board": self.board,
#             "player_symbol": "X",
#         }
#         await self.player1.send(json.dumps(initial_state))

#         initial_state["player_symbol"] = "O"
#         await self.player2.send(json.dumps(initial_state))

#     def check_winner(self):
#         for row in self.board:
#             if row.count(row[0]) == 3 and row[0] != "":
#                 return row[0]

#         for col in range(3):
#             if self.board[0][col] == self.board[1][col] == self.board[2][col] != "":
#                 return self.board[0][col]

#         if self.board[0][0] == self.board[1][1] == self.board[2][2] != "":
#             return self.board[0][0]
#         if self.board[0][2] == self.board[1][1] == self.board[2][0] != "":
#             return self.board[0][2]

#         if all(cell != "" for row in self.board for cell in row):
#             return "draw"

#         return None

#     async def handle_player_input(self, data, player):
#         if not self.running or player != self.current_player:
#             return

#         if data["type"] == "move":
#             row, col = data["row"], data["col"]
#             if self.board[row][col] == "":
#                 symbol = "X" if player == self.player1 else "O"
#                 self.board[row][col] = symbol
#                 self.current_player = (
#                     self.player2 if player == self.player1 else self.player1
#                 )

#                 game_state = {
#                     "type": "game_state",
#                     "board": self.board,
#                     "current_player": (
#                         "X" if self.current_player == self.player1 else "O"
#                     ),
#                 }
#                 await self.send_game_state(game_state)

#                 winner = self.check_winner()
#                 if winner:
#                     self.running = False
#                     await self.handle_game_over(winner)

#     async def send_game_state(self, game_state):
#         await self.player1.send(json.dumps(game_state))
#         await self.player2.send(json.dumps(game_state))

#     @database_sync_to_async
#     def saveScores(self, winner):
#         if winner == "draw":
#             self.player1.user.profile.gainPoints(5)
#             self.player2.user.profile.gainPoints(5)
#         else:
#             gameOverState = {
#                 "type": "game_over",
#                 "scores": {
#                     "playerFront": self.scores["playerBack"],
#                     "playerBack": self.scores["playerFront"],
#                 },
#                 "winner": "left",
#             }
#         await other_player.send(json.dumps(gameOverState))
