import asyncio
import json
import random
import time
from django.utils import timezone
from my_shared_models.serializers import PlayerSerializer
from my_shared_models.models import GameInvitation
from managing.Mapp.models import Game
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import timedelta


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
            TicTacToeQueueManager.add_to_queue(self)

    async def handle_player_disconnect(self, player):
        # if hasattr(self, "game"):
        #     await self.game.handle_player_disconnect(self)
        # else:
        #     GameQueueManager.remove_from_queue(self)
        #     InviteGameManager.remove_from_invite_queue(self)
        pass


class TicTacToeQueueManager:
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
            player1 = cls.queue.pop(0)
            player2 = cls.queue.pop(0)
            game = TicTacToeGameState(player1, player2)
            await game.start()

    @classmethod
    async def handle_player(cls, data, **kwargs):
        pass


class TicTacToeGameState:
    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.player1.receive_handler = self.handle_player_input
        self.player2.receive_handler = self.handle_player_input
        self.player1.disconnect_handler = self.handle_player_disconnect
        self.player2.disconnect_handler = self.handle_player_disconnect
        self.current_player = self.player1
        self.move_timer = None
        self.TIMEOUT_SECONDS = 30
        self.game_start_time = None
        self.init_game_state()

    def init_game_state(self):
        
        self.board = [["" for _ in range(3)] for _ in range(3)]
        self.running = True
        self.winner = None

    async def start(self):
        
        self.player1.game = self
        self.player2.game = self
        self.game_start_time = timezone.now()
        await self.send_initial_state()
        self.start_move_timer()

    def start_move_timer(self):
        
        if self.move_timer:
            self.move_timer.cancel()
        self.move_timer = asyncio.create_task(self.handle_move_timeout())

    async def handle_move_timeout(self):
      
        try:
            await asyncio.sleep(self.TIMEOUT_SECONDS)
            if self.running:
                timed_out_player = self.current_player
                winner = "O" if timed_out_player == self.player1 else "X"
                await self.handle_timeout_game_over(winner)
        except asyncio.CancelledError:
            pass

    @database_sync_to_async
    def set_players_data(self):
        self.player1Data = PlayerSerializer(self.player1.user.profile).data
        self.player2Data = PlayerSerializer(self.player2.user.profile).data

    async def send_initial_state(self):
        await self.set_players_data()
        initial_state = {
            "type": "game_start",
            "board": self.board,
            "player_symbol": "X",
            "timeout_seconds": self.TIMEOUT_SECONDS,
            "current_player": "X",
            "enemy": self.player2Data,
        }
        await self.player1.send(json.dumps(initial_state))

        initial_state["player_symbol"] = "O"
        initial_state["enemy"] = self.player1Data
        await self.player2.send(json.dumps(initial_state))

    async def handle_player_input(self, data, player):
        """Handle player moves and game state updates"""
        if not self.running or player != self.current_player:
            return

        if data["type"] == "move":
            row, col = data["row"], data["col"]
            if self.board[row][col] == "":
                if self.move_timer:
                    self.move_timer.cancel()

                symbol = "X" if player == self.player1 else "O"
                self.board[row][col] = symbol
                self.current_player = (
                    self.player2 if player == self.player1 else self.player1
                )

                game_state = {
                    "type": "game_state",
                    "board": self.board,
                    "current_player": (
                        "X" if self.current_player == self.player1 else "O"
                    ),
                    "last_move": {"row": row, "col": col, "symbol": symbol},
                }
                await self.send_game_state(game_state)

                winner = self.check_winner()
                if winner:
                    self.running = False
                    await self.handle_game_over(winner)
                else:

                    self.start_move_timer()

    async def send_game_state(self, game_state):
      
        await self.player1.send(json.dumps(game_state))
        await self.player2.send(json.dumps(game_state))

    def check_winner(self):
    
        # Check rows
        for row in self.board:
            if row.count(row[0]) == 3 and row[0] != "":
                return row[0]

        # Check columns
        for col in range(3):
            if self.board[0][col] == self.board[1][col] == self.board[2][col] != "":
                return self.board[0][col]

        # Check diagonals
        if self.board[0][0] == self.board[1][1] == self.board[2][2] != "":
            return self.board[0][0]
        if self.board[0][2] == self.board[1][1] == self.board[2][0] != "":
            return self.board[0][2]

        # Check for draw
        if all(cell != "" for row in self.board for cell in row):
            return "draw"

        return None

    async def handle_timeout_game_over(self, winner):
    
        self.running = False
        timeout_state = {
            "type": "game_over",
            "winner": winner,
            "board": self.board,
            "timeout": True,
            "message": f"Player {'X' if self.current_player == self.player1 else 'O'} took too long to move",
        }
        await self.send_game_state(timeout_state)
        await self.saveScores(winner)

    async def handle_game_over(self, winner):
       
        if self.move_timer:
            self.move_timer.cancel()

        await self.saveScores(winner)
        game_over_state = {
            "type": "game_over",
            "winner": winner,
            "board": self.board,
            "timeout": False,
        }
        await self.send_game_state(game_over_state)

    async def handle_player_disconnect(self, player):
       
        if not self.running:
            return

        if self.move_timer:
            self.move_timer.cancel()

        self.running = False
        winner = "O" if player == self.player1 else "X"

        disconnect_state = {
            "type": "game_over",
            "winner": winner,
            "board": self.board,
            "disconnect": True,
            "message": f"Player {'X' if player == self.player1 else 'O'} disconnected",
        }
        await self.send_game_state(disconnect_state)
        await self.saveScores(winner)

    @database_sync_to_async
    def saveScores(self, winner):
       
        game_duration = timezone.now() - self.game_start_time

        if winner == "draw":
            self.player1.user.profile.gainPoints(5)
            self.player2.user.profile.gainPoints(5)
        else:
            winning_player = self.player1 if winner == "X" else self.player2
            losing_player = self.player2 if winner == "X" else self.player1

            winning_player.user.profile.wins += 1
            losing_player.user.profile.losses += 1
            winning_player.user.profile.gainPoints(10)
            losing_player.user.profile.gainPoints(5)

        # Save game record
        game = Game(
            player_one=self.player1.user,
            player_two=self.player2.user,
            winner=(
                None
                if winner == "draw"
                else (self.player1.user if winner == "X" else self.player2.user)
            ),
            score={
                "player1": 1 if winner == "X" else 0,
                "player2": 1 if winner == "O" else 0,
            },
            date_played=timezone.now(),
            duration=game_duration,
            game_mode="TicTacToe",
        )
        game.save()

        # Update player profiles
        self.player1.user.profile.total_games += 1
        self.player2.user.profile.total_games += 1
        self.player1.user.profile.save()
        self.player2.user.profile.save()
