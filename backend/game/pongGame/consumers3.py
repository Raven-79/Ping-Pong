import threading
import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from my_shared_models.models import User, Profile, Game
from asgiref.sync import async_to_sync
import random
import asyncio
import time
from django.shortcuts import get_object_or_404
from urllib.parse import parse_qs

waiting_queue = []  # Global waiting queue for players

# Mock users for testing the matchmaking system
mock_users = [
    {'user_id': 1, 'username': 'PlayerOne','game_id': None, 'group_name': None, 'skill_level': 5},
    {'user_id': 2, 'username': 'PlayerTwo','game_id': None, 'group_name': None, 'skill_level': 7},
    {'user_id': 3, 'username': 'PlayerThree','game_id': None, 'group_name': None, 'skill_level': 4},
    {'user_id': 4, 'username': 'PlayerFour','game_id': None, 'group_name': None, 'skill_level': 6},
]
games = {}  # Dictionary to store game sessions

def matchmake_users(mock_users):
    # Shuffle the users to simulate randomness
    random.shuffle(mock_users)
    # Pair users for the game
    pairs = []
    for i in range(0, len(mock_users), 2):
        if i + 1 < len(mock_users):
            pairs.append((mock_users[i], mock_users[i + 1]))
    return pairs
# Example of running matchmaking with mock data
game_pairs = matchmake_users(mock_users)
for pair in game_pairs:
    print(f"Matched {pair[0]['username']} with {pair[1]['username']}")
print("========================================")
def skill_based_matchmaking(mock_users):
    # Sort users by skill level
    mock_users.sort(key=lambda x: x['skill_level'])
    pairs = []
    for i in range(0, len(mock_users), 2):
        if i + 1 < len(mock_users):
            pairs.append((mock_users[i], mock_users[i + 1]))
    return pairs
# Example of running skill-based matchmaking
skill_pairs = skill_based_matchmaking(mock_users)
for pair in skill_pairs:
    print(f"Matched {pair[0]['username']} with {pair[1]['username']} based on skill")
xlimits = 16.6
zlimits = 24
vitesse = 130
class PongLocalConsumer(WebsocketConsumer):
    def connect(self):
        # Extract query parameters
        print(self.scope['query_string'])
        query_params = parse_qs(self.scope['query_string'].decode())
        user_id = query_params.get('user_id', [None])[0]  # Default to None if not provided
        print(user_id)
        if user_id is None:
            print("No user ID provided")
            self.close()  # Close the connection if user_id is missing
            return
        print(self.scope["user"])
        if self in waiting_queue:
            print('player already connected')
            self.accept()
        # print(self.scope)
        # elif 'game_id' in self.scope['url_route']['kwargs'] and self.scope['url_route']['kwargs']['game_id'] == '123':
        if user_id != None:
            print("new connection ------------------------------------------------")
            # print(self.scope)
            self.isGameOver = False
            self.request_state = True
            self.is_loop_called = False
            self.mouseX = None
            self.mouseXupdate = None
            if len(waiting_queue) == 0:
                # If shared_game_state velocity is not yet defined, initialize it
                direction = random.choice([-1, 1])  # Random direction for the x-axis
                # if 'velocity' not in self.shared_game_state:
                #     self.shared_game_state['velocity'] = {
                #         'x': direction * 20 / vitesse,
                #         'z': 100 / vitesse,
                #         'y': -(120 - 98) / vitesse
                #     }
                # self.shared_game_state['stopped'] = False
                game_id = str(random.randint(100, 9999))
                user = get_object_or_404(User, id=1) #-------------
                self.profile = user.profile
                # print(self.profile.first_name)
                # print(self.profile.last_name)
                # print(self.profile.display_name)
                # print("points: ", self.profile.points)
                # print("wins: ", self.profile.wins)
                # print("losses: ", self.profile.losses)
                # print("total_games: ", self.profile.total_games)
                # print("win_rate: ", self.profile.win_rate)
                # print("win_streak: ", self.profile.win_streak)
                # print("level: ", self.profile.level)
                # self.profile.wins += 1 
                # self.profile.save()
                # Initialize the game state with default positions and velocities
                self.shared_game_state = None
                self.gamecontoler = False
                # Print the game_id
                print(f"Game ID: {game_id}")
                # Randomly select a user and remove them from mock_users
                self.user = mock_users.pop(random.randint(0, len(mock_users) - 1))
                self.game_id = game_id
                self.user['game_id'] = game_id
                self.group_name = f"game_{self.game_id}"
                self.accept()
                # Add the connection to the group
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
                waiting_queue.append(self)
                print(len(waiting_queue))
                self.send(text_data=json.dumps({
                    "message": "Waiting for another player..."
                }))
            elif len(waiting_queue) >= 1:
                user = get_object_or_404(User, id=2) #-------------
                self.profile = user.profile
                print(self.profile.first_name)
                print(self.profile.last_name)
                print(self.profile.display_name)
                print("points: ", self.profile.points)
                print("wins: ", self.profile.wins)
                print("losses: ", self.profile.losses)
                print("total_games: ", self.profile.total_games)
                print("win_rate: ", self.profile.win_rate)
                print("win_streak: ", self.profile.win_streak)
                # print("level: ", self.profile.level)
                # self.profile.wins += 1
                # self.profile.save()

                self.request_state = True
                self.gamecontoler = True
                self.mouseX = None
                self.mouseXupdate = None
                self.is_loop_called = False
                opponent = waiting_queue.pop(0)
                print(opponent.profile.first_name)
                print(opponent.profile.last_name)
                print(opponent.profile.display_name)
                print("points: ", opponent.profile.points)
                print("wins: ", opponent.profile.wins)
                print("losses: ", opponent.profile.losses)
                print("total_games: ", opponent.profile.total_games)
                print("win_rate: ", opponent.profile.win_rate)
                print("win_streak: ", opponent.profile.win_streak)
                print(len(waiting_queue))
                self.user = mock_users.pop(random.randint(0, len(mock_users) - 1))
                self.game_id = opponent.game_id
                self.user['game_id'] = opponent.game_id
                self.group_name = f"game_{self.game_id}"
                direction = random.choice([-1, 1])
                self.shared_game_state = {
                    "player1" : self.profile.first_name,
                    "score1" : 0,
                    "player1_pos": {"x": 0, "y": 65, "z": 25},
                    "score2" : 0,
                    "player2" : opponent.profile.first_name,
                    "player2_pos": {"x": 0, "y": 65, "z": -25},
                    "ball_position": {"x": 0, "y": 0, "z": 0},
                    "ball_velocity": {
                        'x': direction * 50 / vitesse,
                        'z': 100 / vitesse
                        },
                    "stopped" : False,
                    "winer" : None,
                }
                # self.shared_game_state = {
                #     "player1" : self.user['username'],
                #     "player1_pos": {"x": 0, "y": 65, "z": 24.5},
                #     "player2" : opponent.user['username'],
                #     "player2_pos": {"x": 0, "y": 65, "z": -24.5},
                # }
                opponent.shared_game_state = self.shared_game_state
                self.accept()
                # Add the connection to the group
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,    #line 95
                    {
                        "type": "game_start",# Corresponds to the method `game_start` in your consumer
                        "message": {
                            "state": "Game is starting!",
                            "player1": self.profile.first_name,
                            "player2": opponent.profile.first_name,
                            "ball_position": {"x": 0, "y": 65, "z": 0},
                            "ball_velocity": {"x": 0, "y": 0, "z": 0},
                            "paddle1_position": {"x": 0, "y": 65, "z": 25},
                            "paddle2_position": {"x": 0, "y": 65, "z": -25},
                        }
                    }
                )

    def receive(self, text_data): # pong
        # # Parse the incoming data
        # data = json.loads(text_data)
        # message_type = data.get('type')
        # if message_type == 'game.start':
        #     self.handle_game_start(self, data)
        # Parse the incoming data
        data = json.loads(text_data)
        if self.isGameOver == False and self.shared_game_state['stopped'] == False and data['type'] == 'rendring':
            blade_radius = data.get('blade_radius', 1)
            ballRadius = data.get('ballRadius', 1)
            self.mouseX = data['mouseX']
            self.mouseXupdate = data['mouseXupdate']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 13
            if self.mouseX != None and self.mouseX != self.mouseXupdate:
                # if self.gamecontoler == False:
                # print(self.shared_game_state)
                if self.profile.first_name == self.shared_game_state["player1"]:
                    if self.mouseX > self.mouseXupdate and (self.shared_game_state["player1_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4) < field_width_half:
                        new_position = self.shared_game_state["player1_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4
                    elif self.mouseX <= self.mouseXupdate and (self.shared_game_state["player1_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4) > -field_width_half:
                        new_position = self.shared_game_state["player1_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4
                    else:
                        new_position = self.shared_game_state["player1_pos"]['x']
                    self.shared_game_state["player1_pos"]['x'] = new_position

                    self.mouseXupdate = data['mouseXupdate']
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "paddle_position",
                            "paddle_position": {
                                "username": self.profile.first_name,  # Use key-value pairs
                                "paddle_state": self.shared_game_state,  # Use key-value pairs
                            }
                        }
                    )
                elif self.profile.first_name == self.shared_game_state["player2"]:
                    if self.mouseX > self.mouseXupdate and (self.shared_game_state["player2_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4) < field_width_half:
                        new_position = self.shared_game_state["player2_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4
                    elif self.mouseX <= self.mouseXupdate and (self.shared_game_state["player2_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4) > -field_width_half:
                        new_position = self.shared_game_state["player2_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4
                    else:
                        new_position = self.shared_game_state["player2_pos"]['x']
                    self.shared_game_state["player2_pos"]['x'] = new_position
                    self.mouseXupdate = data['mouseXupdate']
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "paddle_position",
                            "paddle_position": {
                                "username": self.profile.first_name,  # Use key-value pairs
                                "paddle_state": self.shared_game_state,  # Use key-value pairs
                            }
                        }
                    )
            if self.shared_game_state['stopped'] == False and self.gamecontoler == True: # pong
                # Handle collisions with paddle1s or walls (example logic)
                field_width_half = 45 # for the ball it's the x = z
                # # update the ball's position. on z axe
                # if self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] >= field_width_half or self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] <= -field_width_half:
                #     self.shared_game_state['ball_velocity']['x'] *= -1  # Reverse the direction on x-axis

                    #******** on x axe
                if self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] >= 16.6 or self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] <= -16.6:
                    self.shared_game_state['ball_velocity']['x'] *= -1  # Reverse the direction on x-axis

                self.shared_game_state['ball_position']['x'] += self.shared_game_state['ball_velocity']['x']

                # Add logic to handle collisions with the paddle1 and adjust ball's direction
                # if self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] >= 26 or self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= -26:
                #     self.shared_game_state['ball_position']['x'] = 0
                #     self.shared_game_state['ball_position']['z'] = 0
                if self.shared_game_state['ball_position']['z'] >= 30 or self.shared_game_state['ball_position']['z'] <= -30:
                    # print(self.shared_game_state["player1_pos"]['z'], self.shared_game_state["player2_pos"]['z'],self.shared_game_state['ball_position']['z'])
                    # time.sleep(5)

                    # print("goaal0")
                    if (self.shared_game_state['ball_position']['z'] >= 30):
                        self.shared_game_state["score1"] += 1
                    else :
                        self.shared_game_state["score2"] += 1
                    # print(self.shared_game_state["score1"], ":", self.shared_game_state["score2"]) #---------------------------------------------------------------------------------
                    # if self.shared_game_state['ball_position']['z'] > 0:
                    #     print("goaal1")
                    #     if self.shared_game_state["player1_pos"]['z'] > 0:
                    #         self.shared_game_state["score2"] += 1
                    #     else :
                    #         self.shared_game_state["score1"] += 1


                    # elif self.shared_game_state['ball_position']['z'] < 0:
                    #     print("goaal2")
                    #     if self.shared_game_state["player1_pos"]['z'] < 0:
                    #         self.shared_game_state["score2"] += 1
                    #     else :
                    #         self.shared_game_state["score1"] += 1
                    self.shared_game_state['ball_position']['x'] = 0
                    self.shared_game_state['ball_position']['z'] = 0
                    direction = random.choice([-1, 1])
                    self.shared_game_state['ball_velocity']['x'] = direction * 50 / vitesse
                    # print(data["lol"])
                else:
                    self.shared_game_state['ball_position']['z'] += self.shared_game_state['ball_velocity']['z']
                if self.shared_game_state['ball_position']['z'] > 0 and self.shared_game_state['ball_position']['z'] < self.shared_game_state["player1_pos"]['z'] and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] >= self.shared_game_state["player1_pos"]['z']:
                    # if self.profile.first_name == self.shared_game_state["player1"]:
                        #  Assuming you have the ball and paddle1 objects defined
                        # print(self.shared_game_state['ball_velocity']['x'], " / ", self.shared_game_state['ball_velocity']['z'], -1 + data.get('lol'))
                        ballX = self.shared_game_state['ball_position']['x']
                        paddle1X = self.shared_game_state["player1_pos"]['x']

                        # Calculate the distance between the ball and paddle1 on the x-axis
                        distanceX = abs(ballX - paddle1X)
                        ballRadius = 1
                        if distanceX <= (3):
                            # print("['z'] > 0 ",distanceX)
                            direction1 = -1 if self.shared_game_state['ball_position']['x'] < self.shared_game_state["player1_pos"]['x'] else 1
                            self.shared_game_state['ball_velocity']['x'] = direction1 * distanceX * 50 / vitesse
                            self.shared_game_state['ball_velocity']['z'] *= -1
                    
                elif self.shared_game_state['ball_position']['z'] < 0 and self.shared_game_state['ball_position']['z'] >= (self.shared_game_state["player2_pos"]['z']) and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= (self.shared_game_state["player2_pos"]['z']) :# and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= -(self.shared_game_state["player2_pos"]['z']): 
                        # if self.profile.first_name == self.shared_game_state["player2"]:
                        # Assuming you have the ball and paddle1 objects defined
                        ballX = -(self.shared_game_state['ball_position']['x'])
                        paddle1X = self.shared_game_state["player2_pos"]['x']

                        # Calculate the distance between the ball and paddle1 on the x-axis
                        distanceX = abs(ballX - paddle1X)
                        ballRadius = 1
                        if distanceX <= (3):
                            direction1 = -1 if self.shared_game_state['ball_position']['x'] > self.shared_game_state["player2_pos"]['x'] else 1
                            # print("['z'] < 0 ",distanceX)
                            self.shared_game_state['ball_velocity']['x'] = direction1 * distanceX * 50 / vitesse
                            self.shared_game_state['ball_velocity']['z'] *= -1
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        "type": "update_game_state",
                        "game_state": {
                            "username": self.profile.first_name,  # Use key-value pairs
                            "shared_state": self.shared_game_state,  # Use key-value pairs
                        }
                    }
                )
                if self.shared_game_state['stopped'] == False and self.shared_game_state["score2"] >= 15 or self.shared_game_state["score1"] >= 15 :
                    self.shared_game_state['stopped'] = True
                    if self.shared_game_state["score2"] >= 15 :
                        self.shared_game_state['winer'] = self.shared_game_state["player2"]
                    elif self.shared_game_state["score1"] >= 15 :
                        self.shared_game_state['winer'] = self.shared_game_state["player1"]
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "game_over",
                            "game_over": {
                                "username": self.profile.first_name,  # Use key-value pairs
                                "shared_state": self.shared_game_state,  # Use key-value pairs
                            }
                        }
                    )
        if self.isGameOver == False and  self.shared_game_state['stopped'] == True and self.shared_game_state != None:
            self.isGameOver = True
            if self.profile.first_name == self.shared_game_state['winer']:
                self.profile.wins += 1
            else :
                self.profile.losses += 1
            self.profile.save()
    def game_over(self, event):
        # Handler for the "game_start" event
        message = event["game_over"]
        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "game_over",
            "player": self.profile.first_name,
            "message": message
        }))
        # Sleep for 2 seconds
        time.sleep(2)
        # asyncio.create_task(self.game_loop())
    def game_start(self, event):
        # Handler for the "game_start" event
        message = event["message"]
        print('sending data to both users')
        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "game_start",
            "player": self.profile.first_name,
            "message": message
        }))
        # Sleep for 2 seconds
        time.sleep(2)
        print('game_start')
        # asyncio.create_task(self.game_loop())
    def send_game_state(self):
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "broadcast_state",
                "game_state": self.shared_game_state
            }
        )
    def broadcast_state(self, event):
        self.send(text_data=json.dumps({
            "type": "game_state",
            "game_state": event['game_state']
        }))

    async def game_loop(self):
        print('sending game state2')
        while True:
            # Run game state updates here (e.g., calculate ball movement, collision detection, etc.)
            # Broadcast the updated game state
            await self.broadcast_game_state()
            # Sleep for a frame duration (e.g., 1/60th of a second for 60 FPS)
            asyncio.sleep(1/60)
    async def broadcast_game_state(self):
        print('sending game state3')
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "update_game_state",
                "game_state": {
                    "username": self.profile.first_name,  # Use key-value pairs
                    "shared_state": self.shared_game_state,  # Use key-value pairs
                }
            }
        )
    def update_game_state(self, event):
        print('sending game state4')
        if self.is_loop_called == False:
            self.is_loop_called = True
        print(self.profile.first_name)
        paddle_position = event['paddle_position']
        ball_position = event['ball_position']
        # Send the updated state back to WebSocket
        self.send(text_data=json.dumps({
            'paddle_position': paddle_position,
            'ball_position': ball_position,
        }))

    def paddle_position(self, event):      
        paddle_position = event["paddle_position"]

        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "paddle_position",
            "message": paddle_position
        }))
    def update_game_state(self, event):
        # print('update_game_state')
        # Handler for the "game_start" event
        if self.gamecontoler == False:
            self.shared_game_state["ball_position"] = event["game_state"]["shared_state"]["ball_position"]
            self.shared_game_state["ball_velocity"] = event["game_state"]["shared_state"]["ball_velocity"]
            self.shared_game_state["stopped"] = event["game_state"]["shared_state"]["stopped"]
            self.shared_game_state["score2"] = event["game_state"]["shared_state"]["score2"]
            self.shared_game_state["score1"] = event["game_state"]["shared_state"]["score1"]
        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "update_game_state",
            "message": event["game_state"]
        }))

    def disconnect(self, close_code):
        mock_users.append(self.user)
        if self in waiting_queue:
            waiting_queue.remove(self)
        # Remove the connection from the group
        try:
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name,
                self.channel_name
            )
        except Exception as e:
            print(f"Error retrieving user: {e}")

class PongRemoteConsumer(WebsocketConsumer):
    async def game_loop(self):
        print('sending game state2')
        while True:
            # Run game state updates here (e.g., calculate ball movement, collision detection, etc.)
            
            # Broadcast the updated game state
            await self.broadcast_game_state()
            
            # Sleep for a frame duration (e.g., 1/60th of a second for 60 FPS)
            asyncio.sleep(1/60)

    async def broadcast_game_state(self):
        print('sending game state3')
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "update_game_state",
                "game_state": {
                    "username": self.user['username'],  # Use key-value pairs
                    "shared_state": self.shared_game_state,  # Use key-value pairs
                }
            }
        ) 
    def update_game_state(self, event):
        print('sending game state4')
        if self.is_loop_called == False:
            self.is_loop_called = True
        print(self.user['username'])
        paddle_position = event['paddle_position']
        ball_position = event['ball_position']

        # Send the updated state back to WebSocket
        self.send(text_data=json.dumps({
            'paddle_position': paddle_position,
            'ball_position': ball_position,
        }))

    def connect(self):
        if self in waiting_queue:
            print('player already connected')
            self.accept()
        # print(self.scope)
        elif 'game_id' in self.scope['url_route']['kwargs'] and self.scope['url_route']['kwargs']['game_id'] == '123':
            self.request_state = True
            self.is_loop_called = False
            self.mouseX = None
            self.mouseXupdate = None
            if len(waiting_queue) == 0:
                
                # If shared_game_state velocity is not yet defined, initialize it
                direction = random.choice([-1, 1])  # Random direction for the x-axis
                
                


                # if 'velocity' not in self.shared_game_state:
                   
                #     self.shared_game_state['velocity'] = {
                #         'x': direction * 20 / vitesse,
                #         'z': 100 / vitesse,
                #         'y': -(120 - 98) / vitesse
                #     }
                # self.shared_game_state['stopped'] = False
                game_id = str(random.randint(100, 9999))
                # Initialize the game state with default positions and velocities
                self.shared_game_state = None
                self.gamecontoler = False
            
                # Print the game_id
                print(f"Game ID: {game_id}")
                # Randomly select a user and remove them from mock_users
                self.user = mock_users.pop(random.randint(0, len(mock_users) - 1))
                self.game_id = game_id
                self.user['game_id'] = game_id
                self.group_name = f"game_{self.game_id}"
                self.accept()

                # Add the connection to the group
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
                waiting_queue.append(self)
                print(len(waiting_queue))
                self.send(text_data=json.dumps({
                    "message": "Waiting for another player..."
                }))
            elif len(waiting_queue) >= 1:
                self.request_state = True
                self.gamecontoler = True
                self.mouseX = None
                self.mouseXupdate = None
                self.is_loop_called = False
                opponent = waiting_queue.pop(0)
                print(len(waiting_queue))
                self.user = mock_users.pop(random.randint(0, len(mock_users) - 1))
                self.game_id = opponent.game_id
                self.user['game_id'] = opponent.game_id
                self.group_name = f"game_{self.game_id}"
                direction = random.choice([-1, 1])
                self.shared_game_state = {
                    "player1" : self.user['username'],
                    "score1" : 0,
                    "player1_pos": {"x": 0, "y": 65, "z": 25},
                    "score2" : 0,
                    "player2" : opponent.user['username'],
                    "player2_pos": {"x": 0, "y": 65, "z": -25},
                    "ball_position": {"x": 0, "y": 0, "z": 0},
                    "ball_velocity": {
                        'x': direction * 50 / vitesse,
                        'z': 100 / vitesse
                        },
                    "stopped" : False,
                }
                # self.shared_game_state = {
                #     "player1" : self.user['username'],
                #     "player1_pos": {"x": 0, "y": 65, "z": 24.5},
                #     "player2" : opponent.user['username'],
                #     "player2_pos": {"x": 0, "y": 65, "z": -24.5},
                # }
                opponent.shared_game_state = self.shared_game_state
                self.accept()
                # Add the connection to the group
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,    #line 95
                    {
                        "type": "game_start",# Corresponds to the method `game_start` in your consumer
                        "message": {
                            "state": "Game is starting!",
                            "player1": self.user['username'],
                            "player2": opponent.user['username'],
                            "ball_position": {"x": 0, "y": 65, "z": 0},
                            "ball_velocity": {"x": 0, "y": 0, "z": 0},
                            "paddle1_position": {"x": 0, "y": 65, "z": 25},
                            "paddle2_position": {"x": 0, "y": 65, "z": -25},
                        }
                    }
                )

    def game_start(self, event):
        # Handler for the "game_start" event
        message = event["message"]
        print('sending data to both users')

        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "game_start",
            "player": self.user['username'],
            "message": message
        }))
        # Sleep for 2 seconds

        time.sleep(2)
        print('game_start')
        # asyncio.create_task(self.game_loop())


    def send_game_state(self):
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "broadcast_state",
                "game_state": self.shared_game_state
            }
        )

    def broadcast_state(self, event):
        self.send(text_data=json.dumps({
            "type": "game_state",
            "game_state": event['game_state']
        }))

    def receive(self, text_data): # pong
        # # Parse the incoming data
        # data = json.loads(text_data)
        # message_type = data.get('type')

        # if message_type == 'game.start':
        #     self.handle_game_start(self, data)
        # Parse the incoming data
        data = json.loads(text_data)
        if data['type'] == 'rendring':
            blade_radius = data.get('blade_radius', 1)
            ballRadius = data.get('ballRadius', 1)
            self.mouseX = data['mouseX']
            self.mouseXupdate = data['mouseXupdate']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 13
            if self.mouseX != None and self.mouseX != self.mouseXupdate:
                # if self.gamecontoler == False:
                #     print(self.shared_game_state)
                if self.user['username'] == self.shared_game_state["player1"]:
                    if self.mouseX > self.mouseXupdate and (self.shared_game_state["player1_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4) < field_width_half:
                        new_position = self.shared_game_state["player1_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4
                    elif self.mouseX <= self.mouseXupdate and (self.shared_game_state["player1_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4) > -field_width_half:
                        new_position = self.shared_game_state["player1_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4
                    else:
                        new_position = self.shared_game_state["player1_pos"]['x']
                    self.shared_game_state["player1_pos"]['x'] = new_position

                    self.mouseXupdate = data['mouseXupdate']
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "paddle_position",
                            "paddle_position": {
                                "username": self.user['username'],  # Use key-value pairs
                                "paddle_state": self.shared_game_state,  # Use key-value pairs
                            }
                        }
                    )
                elif self.user['username'] == self.shared_game_state["player2"]:
                    if self.mouseX > self.mouseXupdate and (self.shared_game_state["player2_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4) < field_width_half:
                        new_position = self.shared_game_state["player2_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4
                    elif self.mouseX <= self.mouseXupdate and (self.shared_game_state["player2_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4) > -field_width_half:
                        new_position = self.shared_game_state["player2_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4
                    else:
                        new_position = self.shared_game_state["player2_pos"]['x']
                    self.shared_game_state["player2_pos"]['x'] = new_position
                    self.mouseXupdate = data['mouseXupdate']
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "paddle_position",
                            "paddle_position": {
                                "username": self.user['username'],  # Use key-value pairs
                                "paddle_state": self.shared_game_state,  # Use key-value pairs
                            }
                        }
                    )
            if self.gamecontoler == True: # pong
                # Handle collisions with paddle1s or walls (example logic)
                field_width_half = 45 # for the ball it's the x = z

                # # update the ball's position. on z axe
                # if self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] >= field_width_half or self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] <= -field_width_half:
                #     self.shared_game_state['ball_velocity']['x'] *= -1  # Reverse the direction on x-axis

                    #******** on x axe
                if self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] >= 16.6 or self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] <= -16.6:
                    self.shared_game_state['ball_velocity']['x'] *= -1  # Reverse the direction on x-axis 
        


                self.shared_game_state['ball_position']['x'] += self.shared_game_state['ball_velocity']['x']
                
                # Add logic to handle collisions with the paddle1 and adjust ball's direction
                # if self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] >= 26 or self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= -26:
                #     self.shared_game_state['ball_position']['x'] = 0
                #     self.shared_game_state['ball_position']['z'] = 0
                if self.shared_game_state['ball_position']['z'] >= 30 or self.shared_game_state['ball_position']['z'] <= -30:
                    # print(self.shared_game_state["player1_pos"]['z'], self.shared_game_state["player2_pos"]['z'],self.shared_game_state['ball_position']['z'])
                    # time.sleep(5)
                    
                    # print("goaal0")
                    if (self.shared_game_state['ball_position']['z'] >= 30):
                        self.shared_game_state["score1"] += 1
                    else :
                        self.shared_game_state["score2"] += 1
                    print(self.shared_game_state["score1"], ":", self.shared_game_state["score2"])
                    # if self.shared_game_state['ball_position']['z'] > 0:
                    #     print("goaal1")
                    #     if self.shared_game_state["player1_pos"]['z'] > 0:
                    #         self.shared_game_state["score2"] += 1
                    #     else :
                    #         self.shared_game_state["score1"] += 1


                    # elif self.shared_game_state['ball_position']['z'] < 0:
                    #     print("goaal2")
                    #     if self.shared_game_state["player1_pos"]['z'] < 0:
                    #         self.shared_game_state["score2"] += 1
                    #     else :
                    #         self.shared_game_state["score1"] += 1
                    self.shared_game_state['ball_position']['x'] = 0
                    self.shared_game_state['ball_position']['z'] = 0
                    direction = random.choice([-1, 1])
                    self.shared_game_state['ball_velocity']['x'] = direction * 50 / vitesse
                    # print(data["lol"])
                else:
                    self.shared_game_state['ball_position']['z'] += self.shared_game_state['ball_velocity']['z']
                if self.shared_game_state['ball_position']['z'] > 0 and self.shared_game_state['ball_position']['z'] < self.shared_game_state["player1_pos"]['z'] and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] >= self.shared_game_state["player1_pos"]['z']:
                    # if self.user['username'] == self.shared_game_state["player1"]:
                        #  Assuming you have the ball and paddle1 objects defined
                        # print(self.shared_game_state['ball_velocity']['x'], " / ", self.shared_game_state['ball_velocity']['z'], -1 + data.get('lol'))
                        ballX = self.shared_game_state['ball_position']['x']
                        paddle1X = self.shared_game_state["player1_pos"]['x']

                        # Calculate the distance between the ball and paddle1 on the x-axis
                        distanceX = abs(ballX - paddle1X)
                        ballRadius = 1
                        
                        if distanceX <= (3):
                            # print("['z'] > 0 ",distanceX)

                            direction1 = -1 if self.shared_game_state['ball_position']['x'] < self.shared_game_state["player1_pos"]['x'] else 1
                            self.shared_game_state['ball_velocity']['x'] = direction1 * distanceX * 50 / vitesse
                            self.shared_game_state['ball_velocity']['z'] *= -1
                    
                elif self.shared_game_state['ball_position']['z'] < 0 and self.shared_game_state['ball_position']['z'] >= (self.shared_game_state["player2_pos"]['z']) and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= (self.shared_game_state["player2_pos"]['z']) :# and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= -(self.shared_game_state["player2_pos"]['z']): 
                        # if self.user['username'] == self.shared_game_state["player2"]:
                        #  Assuming you have the ball and paddle1 objects defined
                        ballX = -(self.shared_game_state['ball_position']['x'])
                        paddle1X = self.shared_game_state["player2_pos"]['x']

                        # Calculate the distance between the ball and paddle1 on the x-axis
                        distanceX = abs(ballX - paddle1X)
                        ballRadius = 1
                        
                        if distanceX <= (3):
                            direction1 = -1 if self.shared_game_state['ball_position']['x'] > self.shared_game_state["player2_pos"]['x'] else 1
                            # print("['z'] < 0 ",distanceX)
                            self.shared_game_state['ball_velocity']['x'] = direction1 * distanceX * 50 / vitesse
                            self.shared_game_state['ball_velocity']['z'] *= -1
                        
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        "type": "update_game_state",
                        "game_state": {
                            "username": self.user['username'],  # Use key-value pairs
                            "shared_state": self.shared_game_state,  # Use key-value pairs
                        }
                    }
                )

    def paddle_position(self, event):      
        paddle_position = event["paddle_position"]

        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "paddle_position",
            "message": paddle_position
        }))

    def update_game_state(self, event):
        # print('update_game_state')
        # Handler for the "game_start" event
        
        if self.gamecontoler == False:
            self.shared_game_state["ball_position"] = event["game_state"]["shared_state"]["ball_position"]
            self.shared_game_state["ball_velocity"] = event["game_state"]["shared_state"]["ball_velocity"]
            self.shared_game_state["stopped"] = event["game_state"]["shared_state"]["stopped"]
            self.shared_game_state["score2"] = event["game_state"]["shared_state"]["score2"]
            self.shared_game_state["score1"] = event["game_state"]["shared_state"]["score1"]


        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "update_game_state",
            "message": event["game_state"]
        }))

    def disconnect(self, close_code):
        if self in waiting_queue:
            waiting_queue.remove(self)
        # Remove the connection from the group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    def receive2(self, text_data):
        # Parse the incoming data
        data = json.loads(text_data)
        if data['type'] == 'mouse_move':
            mouseX = data['mouseX']
            mouseXupdate = data['mouseXupdate']
            paddle_position_x = data['paddle_position_x']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 152.5 / 2
            if mouseX > mouseXupdate and (paddle_position_x + 1) < field_width_half:
                new_position = paddle_position_x + (mouseX - mouseXupdate) / 4
            elif mouseX <= mouseXupdate and (paddle_position_x - 1) > -field_width_half:
                new_position = paddle_position_x - (mouseXupdate - mouseX) / 4
            else:
                new_position = paddle_position_x

            # Send the new paddle position back to the frontend
            self.send(text_data=json.dumps({
                'type': 'mouse_move',
                'new_position': new_position
            }))
        elif data['type'] == 'rendring': 
            # print(data)
            # Extract game state from the received data, with defensive checks
            ball_position = data.get('ball_position', {})
            ball_velocity = data.get('ball_velocity', {})
            paddle1_position = data.get('paddle1_position', {})
            paddle1_velocity = data.get('paddle1_velocity', {})
            paddle2_position = data.get('paddle2_position', {})
            paddle2_velocity = data.get('paddle2_velocity', {})
            vitesse = data.get('vitesse', vitesse)  # Default to speed 1 if not provided
            # print (vitesse)
            blade_radius = data.get('blade_radius', 1)
            ballRadius = data.get('ballRadius', 1)
            mouseX = data['mouseX']
            mouseXupdate = data['mouseXupdate']
            paddle1_position['x'] = paddle1_position['x']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 152.5 / 2
            if mouseX != None :
                if mouseX > mouseXupdate and (paddle1_position['x'] + 1) < field_width_half:
                    new_position = paddle1_position['x'] + (mouseX - mouseXupdate) / 4
                elif mouseX <= mouseXupdate and (paddle1_position['x'] - 1) > -field_width_half:
                    new_position = paddle1_position['x'] - (mouseXupdate - mouseX) / 4
                else:
                    new_position = paddle1_position['x']
                paddle1_position['x'] = new_position
            
            # Handle collisions with paddle1s or walls (example logic)
            field_width_half = 152.5 / 2
            field_height_half = 100 / 2  # Assuming some field height

            # update the ball's position.
            if ball_position['x'] + ball_velocity['x'] >= field_width_half or ball_position['x'] + ball_velocity['x'] <= -field_width_half:
                ball_velocity['x'] *= -1  # Reverse the direction on x-axis
                if paddle2_velocity['x'] != 0:
                    paddle2_velocity['x'] *= -1

            ball_position['x'] += ball_velocity['x']
            ball_position['z'] += ball_velocity['z']

            paddle2_position['x'] += paddle2_velocity['x']
            if ball_position['x'] < -(274 / 2) or ball_position['x'] > (274 / 2):

                ball_position['x'] = 0
                ball_position['z'] = 0
                if paddle2_velocity['x'] != 0 :
                    #   find the final ball x position
                    timeFrame = abs((ball_position['z'] - paddle2_position['z']) / ball_velocity['z'])
                    ballFutureXpos = ball_position['x'] + (ball_velocity['x'] * timeFrame)
                    paddle2_velocity['x'] = (ballFutureXpos - paddle2_position['x']) / (timeFrame)
            elif ball_position['z'] > 0 and ball_position['z'] < paddle1_position['z'] and ball_position['z'] + ball_velocity['z'] >= paddle1_position['z']:
                #  Assuming you have the ball and paddle1 objects defined
                ballX = ball_position['x']
                paddle1X = paddle1_position['x']

                # Calculate the distance between the ball and paddle1 on the x-axis
                distanceX = abs(ballX - paddle1X)

                ballRadius = 1
                if distanceX < (ballRadius + blade_radius):
                    direction1 = -1 if ball_position['x'] < paddle1_position['x'] else 1
                    ball_velocity['x'] = direction1 * distanceX * 5 / vitesse
                    ball_velocity['z'] *= -1
                    #  find the final ball x position
                    timeFrame = abs((ball_position['z'] - paddle2_position['z']) / ball_velocity['z'])
                    ballFutureXpos = ball_position['x'] + (ball_velocity['x'] * timeFrame)
                    paddle2_velocity['x'] = (ballFutureXpos - paddle2_position['x']) / (timeFrame)

            elif ball_position['z'] < 0 and ball_position['z'] > paddle2_position['z'] and ball_position['z'] + ball_velocity['z'] <= paddle2_position['z']:
                #  Assuming you have the ball and paddle2 objects defined
                ballX = ball_position['x']
                paddle1X = paddle2_position['x']

                #  Calculate the distance between the ball and paddle2 on the x-axis
                distanceX = abs(ballX - paddle1X)

                if (distanceX < (ballRadius + blade_radius)) :
                    direction2 = 1 if ball_position['x'] > paddle2_position['x'] else -1
    
                    ball_velocity['x'] = direction2 * distanceX * 5 / vitesse
                    ball_velocity['z'] *= -1
                    paddle2_velocity['x'] = 0

            # After processing the game state, send the updated state back to the frontend
            self.send(text_data=json.dumps({
                'type': 'rendring',
                'ball_position': ball_position, 
                'ball_velocity': ball_velocity,
                'paddle1_position': paddle1_position,
                'paddle1_velocity': paddle1_velocity,
                'paddle2_position': paddle2_position,
                'paddle2_velocity': paddle2_velocity,
                'vitesse': vitesse,
                'blade_radius': blade_radius
            }))

    # def disconnect(self, close_code):
    #     waiting_queue.remove(self)
        # # Remove the connection from the group
        # async_to_sync(self.channel_layer.group_discard)(
        #     self.group_name,
        #     self.channel_name
        # )

class GameConsumer(WebsocketConsumer):
    async def game_loop(self):
        print('sending game state2')
        while True:
            
            # Run game state updates here (e.g., calculate ball movement, collision detection, etc.)
            
            # Broadcast the updated game state
            await self.broadcast_game_state()
            
            # Sleep for a frame duration (e.g., 1/60th of a second for 60 FPS)
            asyncio.sleep(1/60)

    async def broadcast_game_state(self):
        print('sending game state3')
        
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "update_game_state",
                "game_state": {
                    "username": self.user['username'],  # Use key-value pairs
                    "shared_state": self.shared_game_state,  # Use key-value pairs
                }
            }
        )
        
    def update_game_state(self, event):
        print('sending game state4')
        if self.is_loop_called == False:
            self.is_loop_called = True
        print(self.user['username'])
        paddle_position = event['paddle_position']
        ball_position = event['ball_position']

        # Send the updated state back to WebSocket
        self.send(text_data=json.dumps({
            'paddle_position': paddle_position,
            'ball_position': ball_position,
        }))

    def connect(self):
        if self in waiting_queue:
            print('player already connected')
            self.accept()
        # print(self.scope)
        elif 'game_id' in self.scope['url_route']['kwargs'] and self.scope['url_route']['kwargs']['game_id'] == '123':
            self.request_state = True
            self.is_loop_called = False
            self.mouseX = None
            self.mouseXupdate = None
            if len(waiting_queue) == 0:
                
                # If shared_game_state velocity is not yet defined, initialize it
                direction = random.choice([-1, 1])  # Random direction for the x-axis
                vitesse = 100  # Replace with the actual value of vitesse
                self.shared_game_state = {
                    "ball_position": {"x": 0, "y": 120, "z": 0},
                    "ball_velocity": {
                        'x': direction * 20 / vitesse,
                        'z': 100 / vitesse,
                        'y': -(120 - 98) / vitesse
                        },
                    "stopped" : False,
                }
                # if 'velocity' not in self.shared_game_state:
                   
                #     self.shared_game_state['velocity'] = {
                #         'x': direction * 20 / vitesse,
                #         'z': 100 / vitesse,
                #         'y': -(120 - 98) / vitesse
                #     }
                # self.shared_game_state['stopped'] = False
                game_id = str(random.randint(1000, 9999))
                # Initialize the game state with default positions and velocities
                self.game_state = None
                self.gamecontoler = False
            
                # Print the game_id
                print(f"Game ID: {game_id}")
                # Randomly select a user and remove them from mock_users
                self.user = mock_users.pop(random.randint(0, len(mock_users) - 1))
                self.game_id = game_id
                self.user['game_id'] = game_id
                self.group_name = f"game_{self.game_id}"
                self.accept()

                # Add the connection to the group
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
                waiting_queue.append(self)
                print(len(waiting_queue))
                self.send(text_data=json.dumps({
                    "message": "Waiting for another player..."
                }))
            elif len(waiting_queue) >= 1:
                self.request_state = True
                self.gamecontoler = True
                self.mouseX = None
                self.mouseXupdate = None
                self.is_loop_called = False
                opponent = waiting_queue.pop(0)
                print(len(waiting_queue))
                self.user = mock_users.pop(random.randint(0, len(mock_users) - 1))
                self.game_id = opponent.game_id
                self.shared_game_state = opponent.shared_game_state
                self.user['game_id'] = opponent.game_id
                self.group_name = f"game_{self.game_id}"
                    #                 "player1" : self.user['username'],
                    # "player1_pos": {"x": 0, "y": 76 + (120 - 76) / 2, "z": 130},
                    # "player2" : opponent.user['username'],
                    # "player2_pos": {"x": 0, "y": 76 + (120 - 76) / 2, "z": -130},
                self.game_state = {
                    "player1" : self.user['username'],
                    "player1_pos": {"x": 0, "y": 76 + (120 - 76) / 2, "z": 130},
                    "player2" : opponent.user['username'],
                    "player2_pos": {"x": 0, "y": 76 + (120 - 76) / 2, "z": -130},
                }
                opponent.game_state = self.game_state
                self.accept()
                # Add the connection to the group
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,    #line 95
                    {
                        "type": "game_start",# Corresponds to the method `game_start` in your consumer
                        "message": {
                            "state": "Game is starting!",
                            "player1": self.user['username'],
                            "player2": opponent.user['username'],
                            "ball_position": {"x": 0, "y": 120, "z": 0},
                            "ball_velocity": {"x": 0, "y": 120, "z": 0},
                            "paddle1_position": {"x": 0, "y": 76 + (120 - 76) / 2, "z": 130},
                            "paddle2_position": {"x": 0, "y": 76 + (120 - 76) / 2, "z": -130},
                        }
                    }
                )

    def game_start(self, event):
        # Handler for the "game_start" event
        message = event["message"]
        print('sending data to both users')

        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "game_start",
            "player": self.user['username'],
            "message": message
        }))
        # Sleep for 2 seconds

        time.sleep(2)
        print('game_start')
        # asyncio.create_task(self.game_loop())


    def send_game_state(self):
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "broadcast_state",
                "game_state": self.shared_game_state
            }
        )

    def broadcast_state(self, event):
        
        self.send(text_data=json.dumps({
            "type": "game_state",
            "game_state": event['game_state']
        }))

    def receive(self, text_data):
        # # Parse the incoming data
        # data = json.loads(text_data)
        # message_type = data.get('type')

        # if message_type == 'game.start':
        #     self.handle_game_start(self, data)
        # Parse the incoming data
        data = json.loads(text_data)
        if data['type'] == 'rendring':
            blade_radius = data.get('blade_radius', 5)
            ballRadius = data.get('ballRadius', 5)
            self.mouseX = data['mouseX']
            self.mouseXupdate = data['mouseXupdate']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 152.5 / 2
            if self.mouseX != None and self.mouseX != self.mouseXupdate:
                if self.user['username'] == self.game_state["player1"]:
                    if self.mouseX > self.mouseXupdate and (self.game_state["player1_pos"]['x'] + 1) < field_width_half:
                        new_position = self.game_state["player1_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4
                    elif self.mouseX <= self.mouseXupdate and (self.game_state["player1_pos"]['x'] - 1) > -field_width_half:
                        new_position = self.game_state["player1_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4
                    else:
                        new_position = self.game_state["player1_pos"]['x']
                    self.game_state["player1_pos"]['x'] = new_position
                    self.mouseXupdate = data['mouseXupdate']
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "paddle_position",
                            "paddle_position": {
                                "username": self.user['username'],  # Use key-value pairs
                                "paddle_state": self.game_state,  # Use key-value pairs
                            }
                        }
                    )
                elif self.user['username'] == self.game_state["player2"]:
                    if self.mouseX > self.mouseXupdate and (self.game_state["player2_pos"]['x'] + 1) < field_width_half:
                        new_position = self.game_state["player2_pos"]['x'] + (self.mouseX - self.mouseXupdate) / 4
                    elif self.mouseX <= self.mouseXupdate and (self.game_state["player2_pos"]['x'] - 1) > -field_width_half:
                        new_position = self.game_state["player2_pos"]['x'] - (self.mouseXupdate - self.mouseX) / 4
                    else:
                        new_position = self.game_state["player2_pos"]['x']
                    self.game_state["player2_pos"]['x'] = new_position
                    self.mouseXupdate = data['mouseXupdate']
                    async_to_sync(self.channel_layer.group_send)(
                        self.group_name,
                        {
                            "type": "paddle_position",
                            "paddle_position": {
                                "username": self.user['username'],  # Use key-value pairs
                                "paddle_state": self.game_state,  # Use key-value pairs
                            }
                        }
                    )
            if self.gamecontoler == True:
            
                # Handle collisions with paddle1s or walls (example logic)
                field_width_half = 152.5 / 2
                field_height_half = 100 / 2  # Assuming some field height

                # update the ball's position.
                if self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] >= field_width_half or self.shared_game_state['ball_position']['x'] + self.shared_game_state['ball_velocity']['x'] <= -field_width_half:
                    self.shared_game_state['ball_velocity']['x'] *= -1  # Reverse the direction on x-axis

                self.shared_game_state['ball_position']['x'] += self.shared_game_state['ball_velocity']['x']

                if self.shared_game_state['ball_position']['y'] + self.shared_game_state['ball_velocity']['y'] > 120:
                    self.shared_game_state['ball_velocity']['y'] *= -1

                self.shared_game_state['ball_position']['y'] += self.shared_game_state['ball_velocity']['y']
                self.shared_game_state['ball_position']['z'] += self.shared_game_state['ball_velocity']['z']
                # Add logic to handle collisions with the paddle1 and adjust ball's direction
                if self.shared_game_state['ball_position']['y'] < 76 or self.shared_game_state['ball_position']['x'] < -(274 / 2) or self.shared_game_state['ball_position']['x'] > (274 / 2):

                    self.shared_game_state['ball_position']['x'] = 0
                    self.shared_game_state['ball_position']['y'] = 120
                    self.shared_game_state['ball_position']['z'] = 0
                if self.shared_game_state['ball_position']['z'] > 0 and self.shared_game_state['ball_position']['z'] < self.game_state["player1_pos"]['z'] and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] >= self.game_state["player1_pos"]['z']:
                    # if self.user['username'] == self.game_state["player1"]:
                        #  Assuming you have the ball and paddle1 objects defined
                        print('*********zzzzzzzzzzz',self.shared_game_state['ball_position']['z'] , self.game_state["player1_pos"]['z'])
                        print('*********xxxxxxxxxxx',self.shared_game_state['ball_position']['x'] , self.game_state["player1_pos"]['x'])
                        ballX = self.shared_game_state['ball_position']['x']
                        paddle1X = self.game_state["player1_pos"]['x']

                        # Calculate the distance between the ball and paddle1 on the x-axis
                        distanceX = abs(ballX - paddle1X)

                        # Assuming you have the ball and paddle1 objects defined
                        ballY = self.shared_game_state['ball_position']['y']
                        paddle1Y = self.game_state["player1_pos"]['y']

                        #  Calculate the distance between the ball and paddle1 on the y-axis
                        distanceY = abs(ballY - paddle1Y)
                        ballRadius = 5
                        if distanceX < (10):
                            direction1 = -1 if self.shared_game_state['ball_position']['x'] > self.game_state["player1_pos"]['x'] else 1
                            vitesse = 100
                            self.shared_game_state['ball_velocity']['x'] = direction1 * distanceX * 5 / vitesse
                            self.shared_game_state['ball_velocity']['y'] *= -1
                            self.shared_game_state['ball_velocity']['z'] *= -1
                    
                elif self.shared_game_state['ball_position']['z'] < 0 and self.shared_game_state['ball_position']['z'] >= (self.game_state["player2_pos"]['z']) and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= (self.game_state["player2_pos"]['z']) :# and self.shared_game_state['ball_position']['z'] + self.shared_game_state['ball_velocity']['z'] <= -(self.game_state["player2_pos"]['z']): 
                        # if self.user['username'] == self.game_state["player2"]:
                        #  Assuming you have the ball and paddle1 objects defined
                        print('zzzzzzzzzzz',self.shared_game_state['ball_position']['z'] , (self.game_state["player2_pos"]['z']))
                        print('xxxxxxxxxxx',self.shared_game_state['ball_position']['x'] , self.game_state["player1_pos"]['x'])
                        ballX = -(self.shared_game_state['ball_position']['x'])
                        paddle1X = self.game_state["player2_pos"]['x']

                        # Calculate the distance between the ball and paddle1 on the x-axis
                        distanceX = abs(ballX - paddle1X)

                        # Assuming you have the ball and paddle1 objects defined
                        ballY = self.shared_game_state['ball_position']['y']
                        paddle1Y = self.game_state["player2_pos"]['y']

                        #  Calculate the distance between the ball and paddle1 on the y-axis
                        distanceY = abs(ballY - paddle1Y)
                        ballRadius = 5
                        if distanceX < (10):
                            direction1 = -1 if self.shared_game_state['ball_position']['x'] > self.game_state["player2_pos"]['x'] else 1
                            vitesse = 100
                            self.shared_game_state['ball_velocity']['x'] = direction1 * distanceX * 5 / vitesse
                            self.shared_game_state['ball_velocity']['y'] *= -1
                            self.shared_game_state['ball_velocity']['z'] *= -1
                        
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        "type": "update_game_state",
                        "game_state": {
                            "username": self.user['username'],  # Use key-value pairs
                            "shared_state": self.shared_game_state,  # Use key-value pairs
                        }
                    }
                )
                # if self.is_loop_called == False:
                #     self.is_loop_called = True
                #     async_to_sync(self.game_loop)() 
    def paddle_position(self, event):      
        paddle_position = event["paddle_position"]

        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "paddle_position",
            "message": paddle_position
        }))

    def update_game_state(self, event):
        # print('update_game_state')
        # Handler for the "game_start" event
        game_state = event["game_state"]
        
        if self.gamecontoler == False:
            self.shared_game_state = game_state['shared_state']

        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            "type": "update_game_state",
            "message": game_state
        }))

    def disconnect(self, close_code):
        if self in waiting_queue:
            waiting_queue.remove(self)
        # Remove the connection from the group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    # def receive(self, text_data):
    #     # Parse the incoming data
    #     data = json.loads(text_data)
    #     print(data)

    #     # Check if there is another player waiting
    #     if len(waiting_queue) >= 1:
    #         # Match the player with one from the waiting queue
    #         player1 = self
    #         player2 = waiting_queue.pop(0)
            
    #         # Ensure both players have a valid game_id
    #         if player1.user['game_id'] is None:
    #             game_id = str(random.randint(1000, 9999))
    #             player1.user['game_id'] = game_id
    #             player2.user['game_id'] = game_id
    #         else:
    #             player2.user['game_id'] = player1.user['game_id']

    #         # Assign group names based on game_id
    #         player1.user['group_name'] = f"game_{player1.user['game_id']}"
    #         player2.user['group_name'] = f"game_{player1.user['game_id']}"

    #         # Store the game session
    #         games[player1.user['game_id']] = (player1, player2)

    #         # Add both players to the WebSocket group
    #         async_to_sync(player1.channel_layer.group_add)(player1.user['group_name'], player1.channel_name)
    #         async_to_sync(player2.channel_layer.group_add)(player2.user['group_name'], player2.channel_name)

    #         # Accept connections
    #         player1.accept()
    #         self.send(text_data=json.dumps({
    #             "message": "Connection accepted"
    #         }))

    #         # Notify the group that the game has started
    #         game_id = player1.user['game_id']
    #         async_to_sync(self.channel_layer.group_send)(
    #             player1.user['group_name'],
    #             {
    #                 'type': 'game.start',
    #                 'message': f'Game {game_id} has started!',
    #             }
    #         )
    #     else:
    #         # If no other players are waiting, add this player to the queue
    #         self.user['game_id'] = str(random.randint(1000, 9999))
    #         self.user['group_name'] = f"game_{self.user['game_id']}"
    #         waiting_queue.append(self)

    #         # Accept the connection
    #         self.accept()
    #         self.send(text_data=json.dumps({
    #             "message": "Connection accepted"
    #         }))

    # def handle_game_start(self, data):
    #     # Logic for handling game start
    #     self.send(text_data=json.dumps({
    #         'message': 'Game has started',
    #         'players': data.get('players', [])
    #     }))
    #     # self.user = mock_users[random.randint(0, len(mock_users) - 1)]
    #     # mock_users.remove(self.user)
        
    #     # # If there are two players in the queue, start a game
    #     # if len(waiting_queue) >= 1:
    #     #     player1 = self
    #     #     player2 = waiting_queue.pop(0)
            
    #     #     print("====================================================")
    #     #     player1.user['game_id'] = player2.user['game_id']
    #     #     self.group_name = player2.group_name
    #     #     print(self.group_name)
    #     #     # if player1.user['game_id'] == None or player2.user['game_id'] == None :
    #     #     #     if player1.user['game_id'] != None and  player2.user['game_id'] == None :
    #     #     #         player2.user['game_id'] = player1.user['game_id']
    #     #     #     elif player1.user['game_id'] == None and  player2.user['game_id'] != None :
    #     #     #         player1.user['game_id'] = player2.user['game_id']
    #     #     #     elif player1.user['game_id'] == None and  player2.user['game_id'] == None :
    #     #     #         # Generate a new game ID
    #     #     #         game_id = str(random.randint(1000, 9999))
    #     #     #         player1.user['game_id'] = game_id
    #     #     #         player2.user['game_id'] = game_id
    #     #     # Assign both players to the same game group
    #     #     games[player1.user['game_id']] = (player1, player2)

    #     #     # Notify the players that they have been matched
            
    #     #     # player1.user['group_name'] = f"game_{player1.user['game_id']}"
    #     #     # player1.group_name = player1.user['group_name']
    #     #     # player2.user['group_name'] = f"game_{player1.user['game_id']}"
    #     #     # player2.group_name = player2.user['group_name']

    #     #     # Add both players to the WebSocket group
    #     #     async_to_sync(player1.channel_layer.group_add)(player1.user['group_name'], player1.channel_name)
    #     #     async_to_sync(player2.channel_layer.group_add)(player2.user['group_name'], player2.channel_name)

    #     #     # Accept the connections for both players
    #     #     player1.accept()
    #     #     player2.accept()

    #     #     # Notify both players that the game is starting
    #     #     game_id = player1.user['game_id']
    #     #     async_to_sync(self.channel_layer.group_send)(
    #     #         player1.user['group_name'],
    #     #         {
    #     #             'type': 'game.start',
    #     #             'message': f'Game {game_id} has started!',
    #     #         }
    #     #     )
    #     # elif self.user['group_name'] is None:
    #     #     # Add the player to the waiting queue
    #     #     # Generate a new game ID
    #     #     self.user['game_id'] = str(random.randint(1000, 9999))
    #     #     self.user['group_name'] = f"game_{self.user['game_id']}"
    #     #     self.group_name = self.user['group_name']
    #     #     waiting_queue.append(self)






    #     # # Randomly assign a mock user to simulate a real user
    #     # player1 = random.choice(mock_users)
    #     # # self.group_name = f"game_{self.user['user_id']}"
    #     # mock_users.pop(player1)
    #     # # Add the player to the waiting queue
    #     # self.user = player1
    #     # waiting_queue.append(self)
    #     # player2 = random.choice(mock_users)
    #     # # self.group_name = f"game_{self.user['user_id']}"
    #     # mock_users.pop(player1)
    #     # # Generate a new game ID
    #     # game_id = str(random.randint(1000, 9999))
    #     # games[game_id] = (player1, player2)
    #     # # Notify the players that they have been matched
    #     # player1.user['game_id'] = game_id
    #     # player2.user['game_id'] = game_id
    #     # player1.user['group_name'] = f"game_{game_id}"
    #     # player2.user['group_name'] = f"game_{game_id}"
    #     # # Add both players to the WebSocket group
    #     # async_to_sync(player1.channel_layer.group_add)(
    #     #     player1.user['group_name'],
    #     #     player1.channel_name
    #     # )
    #     # async_to_sync(player2.channel_layer.group_add)(
    #     #     player2.user['group_name'],
    #     #     player2.channel_name
    #     # )



    #     # # Assign each user to a unique game group
    #     # # You could also assign users to groups dynamically based on game matching logic
    #     # self.game_id = self.scope['url_route']['kwargs']['game_id']
    #     # self.group_name = f"game_{self.game_id}"

    #     # # Add the connection to the group
    #     # async_to_sync(self.channel_layer.group_add)(
    #     #     self.group_name,
    #     #     self.channel_name
    #     # )

    #     # # Accept the WebSocket connection
    #     # self.accept()
    #     # print(f"{self.user['username']} connected to the group: {self.group_name}")


    def receive2(self, text_data):
        # # Parse the incoming data
        # data = json.loads(text_data)
        # message_type = data.get('type')

        # if message_type == 'game.start':
        #     self.handle_game_start(self, data)
        # Parse the incoming data
        data = json.loads(text_data)
        if data['type'] == 'mouse_move':
            mouseX = data['mouseX']
            mouseXupdate = data['mouseXupdate']
            paddle_position_x = data['paddle_position_x']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 152.5 / 2
            if mouseX > mouseXupdate and (paddle_position_x + 1) < field_width_half:
                new_position = paddle_position_x + (mouseX - mouseXupdate) / 4
            elif mouseX <= mouseXupdate and (paddle_position_x - 1) > -field_width_half:
                new_position = paddle_position_x - (mouseXupdate - mouseX) / 4
            else:
                new_position = paddle_position_x

            # Send the new paddle position back to the frontend
            self.send(text_data=json.dumps({
                'type': 'mouse_move',
                'new_position': new_position
            }))
        elif data['type'] == 'rendring': 
            # print(data)
            # Extract game state from the received data, with defensive checks
            ball_position = data.get('ball_position', {})
            ball_velocity = data.get('ball_velocity', {})
            paddle1_position = data.get('paddle1_position', {})
            paddle1_velocity = data.get('paddle1_velocity', {})
            paddle2_position = data.get('paddle2_position', {})
            paddle2_velocity = data.get('paddle2_velocity', {})
            vitesse = data.get('vitesse', 1)  # Default to speed 1 if not provided
            # print (vitesse)
            blade_radius = data.get('blade_radius', 5)
            ballRadius = data.get('ballRadius', 5)
            mouseX = data['mouseX']
            mouseXupdate = data['mouseXupdate']
            paddle1_position['x'] = paddle1_position['x']  # Receive the current paddle position

            # Calculate new paddle position based on mouse movement
            field_width_half = 152.5 / 2
            if mouseX != None :
                if mouseX > mouseXupdate and (paddle1_position['x'] + 1) < field_width_half:
                    new_position = paddle1_position['x'] + (mouseX - mouseXupdate) / 4
                elif mouseX <= mouseXupdate and (paddle1_position['x'] - 1) > -field_width_half:
                    new_position = paddle1_position['x'] - (mouseXupdate - mouseX) / 4
                else:
                    new_position = paddle1_position['x']
                paddle1_position['x'] = new_position
            # print(ball_position)

        #    # Initialize velocity if it doesn't exist
        #     if 'ball_velocity' not in data or data['ball_velocity'] is None:
        #         direction = random.choice([-1, 1])  # Random direction for x-axis
        #         data['ball_velocity'] = {
        #             'x': direction * 20 / vitesse,
        #             'z': 100 / vitesse,
        #             'y': -(120 - 98) / vitesse
        #         }
        #         data['stopped'] = False

            # Make sure ball position exists
            # if 'ball_position' not in data:
            #     ball_position = {'x': 0, 'y': 0, 'z': 0}  # Default ball position

            # Initialize paddle2 velocity and position if they don't exist
            # if 'paddle2_velocity' not in data or paddle2_velocity is None:
            #     paddle2_velocity = {'x': 0, 'y': 0, 'z': 0}
            
            # if 'position' not in paddle2:
            #     paddle2_position = {'x': 0, 'y': 0, 'z': 0}

            # # Update ball position based on velocity and speed
            # ball_position['x'] += ball_velocity['x'] * vitesse
            # ball_position['y'] += ball_velocity['y'] * vitesse
            # ball_position['z'] += ball_velocity['z'] * vitesse
            
            # Handle collisions with paddle1s or walls (example logic)
            field_width_half = 152.5 / 2
            field_height_half = 100 / 2  # Assuming some field height

            # update the ball's position.
            if ball_position['x'] + ball_velocity['x'] >= field_width_half or ball_position['x'] + ball_velocity['x'] <= -field_width_half:
                ball_velocity['x'] *= -1  # Reverse the direction on x-axis
                if paddle2_velocity['x'] != 0:
                    paddle2_velocity['x'] *= -1

            ball_position['x'] += ball_velocity['x']

            if ball_position['y'] + ball_velocity['y'] > 120:
                ball_velocity['y'] *= -1

            ball_position['y'] += ball_velocity['y']
            ball_position['z'] += ball_velocity['z']


            # if 'paddle2_velocity' not in data or paddle2_velocity is None:
            #     direction = random.choice([-1, 1])  # Random direction for x-axis
            #     paddle2_velocity = {
            #         'x': direction * 20 / vitesse,
            #         'z': 100 / vitesse,
            #         'y': -(120 - 98) / vitesse
            #     }
            paddle2_position['x'] += paddle2_velocity['x']

            # if ball_position['y'] >= field_height_half or ball_position['y'] <= -field_height_half:
            #     ball_velocity['y'] *= -1  # Reverse the direction on y-axis

            # Ball collision logic
            # Add logic to handle collisions with the paddle1 and adjust ball's direction
            if ball_position['y'] < 76 or ball_position['x'] < -(274 / 2) or ball_position['x'] > (274 / 2):

                ball_position['x'] = 0
                ball_position['y'] = 120
                ball_position['z'] = 0
                if paddle2_velocity['x'] != 0 :
                    #   find the final ball x position
                    timeFrame = abs((ball_position['z'] - paddle2_position['z']) / ball_velocity['z'])
                    ballFutureXpos = ball_position['x'] + (ball_velocity['x'] * timeFrame)
                    paddle2_velocity['x'] = (ballFutureXpos - paddle2_position['x']) / (timeFrame)
            elif ball_position['z'] > 0 and ball_position['z'] < paddle1_position['z'] and ball_position['z'] + ball_velocity['z'] >= paddle1_position['z']:
                #  Assuming you have the ball and paddle1 objects defined
                ballX = ball_position['x']
                paddle1X = paddle1_position['x']

                # Calculate the distance between the ball and paddle1 on the x-axis
                distanceX = abs(ballX - paddle1X)

                # Assuming you have the ball and paddle1 objects defined
                ballY = ball_position['y']
                paddle1Y = paddle1_position['y']

                #  Calculate the distance between the ball and paddle1 on the y-axis
                distanceY = abs(ballY - paddle1Y)
                ballRadius = 5
                if distanceX < (ballRadius + blade_radius):
                    direction1 = -1 if ball_position['x'] < paddle1_position['x'] else 1
                    ball_velocity['x'] = direction1 * distanceX * 5 / vitesse
                    ball_velocity['y'] *= -1
                    ball_velocity['z'] *= -1
                    #  find the final ball x position
                    timeFrame = abs((ball_position['z'] - paddle2_position['z']) / ball_velocity['z'])
                    ballFutureXpos = ball_position['x'] + (ball_velocity['x'] * timeFrame)
                    paddle2_velocity['x'] = (ballFutureXpos - paddle2_position['x']) / (timeFrame)

            elif ball_position['z'] < 0 and ball_position['z'] > paddle2_position['z'] and ball_position['z'] + ball_velocity['z'] <= paddle2_position['z']:
                #  Assuming you have the ball and paddle2 objects defined
                ballX = ball_position['x']
                paddle1X = paddle2_position['x']

                #  Calculate the distance between the ball and paddle2 on the x-axis
                distanceX = abs(ballX - paddle1X)

                #  Assuming you have the ball and paddle2 objects defined
                ballY = ball_position['y']
                paddle1Y = paddle2_position['y']

                # Calculate the distance between the ball and paddle2 on the y-axis
                distanceY = abs(ballY - paddle1Y)
                if (distanceX < (ballRadius + blade_radius)) :
                    direction2 = 1 if ball_position['x'] > paddle2_position['x'] else -1
    
                    ball_velocity['x'] = direction2 * distanceX * 5 / vitesse
                    ball_velocity['y'] *= -1
                    ball_velocity['z'] *= -1
                    paddle2_velocity['x'] = 0
            # After processing the game state, send the updated state back to the frontend
            self.send(text_data=json.dumps({
                'type': 'rendring',
                'ball_position': ball_position, 
                'ball_velocity': ball_velocity,
                'paddle1_position': paddle1_position,
                'paddle1_velocity': paddle1_velocity,
                'paddle2_position': paddle2_position,
                'paddle2_velocity': paddle2_velocity,
                'vitesse': vitesse,
                'blade_radius': blade_radius
            }))

    # def disconnect(self, close_code):
    #     waiting_queue.remove(self)
        # # Remove the connection from the group
        # async_to_sync(self.channel_layer.group_discard)(
        #     self.group_name,
        #     self.channel_name
        # )