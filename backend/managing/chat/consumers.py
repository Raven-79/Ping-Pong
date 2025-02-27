import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from chat.models import Chat, Message
from my_shared_models.models import Friend, User, GameInvitation

from channels.db import database_sync_to_async
from django.db.models import Q

# User = get_user_model()

connected_users = {}
connected_rooms = {}


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Chat WebSocket connected")
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.accept()
            connected_users[self.user.id] = self.channel_name

            for user_id, channel_name in connected_users.items():
                print(f"  User ID: {user_id}, Channel Name: {channel_name}")

            self.friends = await self.get_friends(self.user.id)
            print(
                f"[DEBUG] User '{self.user.username}' connected. Friends: {[f.username for f in self.friends]}"
            )
            online_friends = [
                {
                    "user_id": friend.id,
                    "username": friend.username,
                    "status": "online",
                }
                for friend in self.friends
                if friend.id in connected_users  # Only include online friends
            ]

            # Send the initial list of online friends to the user
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "initial_status",
                        "friend_list": online_friends,
                    }
                )
            )

            status_update = {
                "user_id": self.user.id,
                "username": self.user.username,
                "status": "online",
            }
            for friend in self.friends:
                if friend.id in connected_users:  # Only notify online friends
                    await self.channel_layer.send(
                        connected_users[friend.id],
                        {
                            "type": "friend_status_update",
                            "friend_update": status_update,
                        },
                    )

            print(
                f"[CONNECT] User '{self.user.username}' connected with channel name '{self.channel_name}'."
            )
            print(f"[INFO] Total connected users: {len(connected_users)}")

        else:
            print("[CONNECT] WebSocket connection rejected: User not authenticated.")
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # Remove user from groups
            status_update = {
                "user_id": self.user.id,
                "username": self.user.username,
                "status": "offline",
            }
        
        self.friends = await self.get_friends(self.user.id)


        for friend in self.friends:
            if friend.id in connected_users:  # Only notify online friends
                await self.channel_layer.send(
                    connected_users[friend.id],
                    {
                        "type": "friend_status_update",
                        "friend_update": status_update,
                    },
                )

            if self.user.id in connected_users:
                del connected_users[self.user.id]

            print(f"[DISCONNECT] User '{self.user.username}' disconnected.")
            print(f"[INFO] Total connected users: {len(connected_users)}")

    async def friend_status_update(self, event):
        # Send a friend's status update to the frontend
        await self.send(
            text_data=json.dumps(
                {
                    "type": "friend_status_update",
                    "friend_update": event["friend_update"],
                }
            )
        )

    async def user_status_update(self, event):
        if self.user.id != event["user_id"]:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "user_status_update",
                        "user_id": event["user_id"],
                        "username": event["username"],
                        "status": event["status"],
                    }
                )
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
            message_type = data.get("type")

            print(f"[RECEIVE] Message type: {message_type}")

            if message_type == "join_chat":
                print(
                    f"[JOIN_CHAT] User '{self.user.username}' joining chat. with id '{self.user.id}"
                )
                receiver_id = int(data.get("receiver_id"))

                self.room_name = f"chat{min(self.user.id, receiver_id)}_{max(self.user.id, receiver_id)}"
                print(
                    f"[JOIN_CHAT] User '{self.user.username}' joining chat {self.room_name}."
                )

                try:

                    for room_name, users in connected_rooms.items():
                        if self.user.id in users:
                            await self.channel_layer.group_discard(
                                room_name, self.channel_name
                            )
                            connected_rooms[room_name].remove(self.user.id)
                            break

                    await self.channel_layer.group_add(
                        self.room_name, self.channel_name
                    )

                    if self.room_name not in connected_rooms:
                        connected_rooms[self.room_name] = set()
                    connected_rooms[self.room_name].add(self.user.id)

                    sender = await self.get_user_by_id(self.user.id)
                    receiver = await self.get_user_by_id(receiver_id)
                    chat, created = await self.get_or_create_chat(sender, receiver)

                    messages = await self.get_last_20_messages(chat, receiver_id)

                    message_list = await self.get_message_list(
                        messages, chat, receiver_id
                    )

                    print(
                        f"[JOIN_CHAT] Sending previous messages to '{self.user.username}'."
                    )
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "load_previous_messages",
                                "messages": message_list,
                            }
                        )
                    )

                except Exception as e:
                    print(f"[ERROR] Failed to join chat: {e}")
                    await self.send(
                        text_data=json.dumps(
                            {"type": "error", "message": "Failed to join the chat."}
                        )
                    )

            elif message_type == "chat":
                receiver_id = int(data.get("receiver_id"))
                message_content = data.get("message")
                message_type = data.get("message_type")
                self.room_name = f"chat{min(self.user.id, receiver_id)}_{max(self.user.id, receiver_id)}"

                print(
                    f"[CHAT] '{self.user.username}' sending message: {message_content}"
                )
                # check if receiver_id is in connected_rooms that has the same room_name, if true we mark the message as read

                is_receiver_online = (
                    self.room_name in connected_rooms
                    and receiver_id in connected_rooms[self.room_name]
                )

                print(
                    f"[CHAT]  {self.user.username} Receiver  {receiver_id} is online: {is_receiver_online}"
                )

                from_user = await self.get_user_by_id(self.user.id)
                to_user = await self.get_user_by_id(receiver_id)

                chat = await self.get_chat(from_user, to_user)
                newType = 0
                if message_type == "text":
                    newType = 0
                elif message_type == "invitation":
                    newType = 1
                elif message_type == "warning":
                    newType = 2
                message = await self.save_message(
                    from_user,
                    to_user,
                    chat,
                    message_content,
                    newType,
                    is_receiver_online,
                )

                # Check if the receiver is in the same room
                if is_receiver_online:
                    # Broadcast the message to the room
                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            "id": message.id,
                            "type": "chat_message",
                            "message": message_content,
                            "sender": self.user.username,
                            "sender_id": self.user.id,
                            "chat_id": chat.id,
                            "time": message.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
                            "message_type": message.type,
                            "invitation": serialize_invite(message.invitation),
                            
                        },
                    )
                    print(
                        f"[CHAT] Message broadcasted to room '{self.room_name}' for receiver ID {receiver_id}."
                    )
                elif receiver_id in connected_users:  # Check if the receiver is online
                    # Send the message directly to the receiver's WebSocket channel
                    temp_group = f"direct_{self.user.id}_{receiver_id}"
                    await self.channel_layer.group_add(temp_group, self.channel_name)
                    await self.channel_layer.group_add(
                        temp_group, connected_users[receiver_id]
                    )

                    # Send the message to both users via the temporary group
                    await self.channel_layer.group_send(
                        temp_group,
                        {
                            "id": message.id,
                            "type": "chat_message",
                            "message": message_content,
                            "sender": self.user.username,
                            "sender_id": self.user.id,
                            "chat_id": chat.id,
                            "time": message.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
                            "message_type": message.type,
                            "invitation": serialize_invite(message.invitation),
                        },
                    )

                    # Remove the temporary group after sending the message
                    await self.channel_layer.group_discard(
                        temp_group, self.channel_name
                    )
                    await self.channel_layer.group_discard(
                        temp_group, connected_users[receiver_id]
                    )

                    print(
                        f"[CHAT] Message sent to both sender (ID: {self.user.id}) and receiver (ID: {receiver_id})."
                    )
                else:
                    await self.send(
                        text_data=json.dumps(
                            {
                                "id": message.id,
                                "type": "chat_message",
                                "message": message_content,
                                "sender": self.user.username,
                                "sender_id": self.user.id,
                                "chat_id": chat.id,
                                "time": message.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
                                "message_type": message.type,
                                "invitation": serialize_invite(message.invitation),
                            }
                        )
                    )
                    print(
                        f"[CHAT] Receiver (ID: {receiver_id}) is not connected. Message sent only to sender."
                    )

            elif message_type == "leave_chat":
                print(f"[LEAVE_CHAT] User '{self.user.username}' leaving chat.")
                await self.leave_chat(self.room_name)

            elif message_type == "block_user":
                print("block_user")
                print(data.get("friend_id"))
                receiver_id = int(data.get("friend_id"))
                self.room_name = f"chat{min(self.user.id, receiver_id)}_{max(self.user.id, receiver_id)}"
                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        "type": "block_user",
                        "blocker_id": self.user.id,
                        "blocked_id": receiver_id,
                    },
                )
            
            elif message_type == "initial_status_request":
                print("initial_status_request")
                self.friends = await self.get_friends(self.user.id)
                online_friends = [
                    {
                        "user_id": friend.id,
                        "username": friend.username,
                        "status": "online",
                    }
                    for friend in self.friends
                    if friend.id in connected_users
                ]
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "initial_status",
                            "friend_list": online_friends,
                        }
                    )
                )
        except Exception as e:
            print(f"[ERROR] Error processing message: {e}")
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "error",
                        "message": "An error occurred while processing your request.",
                    }
                )
            )

    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        sender_id = event["sender_id"]
        chat_id = event["chat_id"]
        time = event["time"]
        message_type = event["message_type"]
        invitation = event["invitation"]

        print(f"[CHAT_MESSAGE] Broadcasting message from '{sender}': {message}")
        await self.send(
            text_data=json.dumps(
                {
                    "id": event["id"],
                    "type": "chat_message",
                    "message": message,
                    "sender": sender,
                    "sender_id": sender_id,
                    "chat_id": chat_id,
                    "time": time,
                    "message_type": message_type,
                    "invitation": invitation,
                }
            )
        )

    async def block_user(self, event):
        blocker_id = event["blocker_id"]
        blocked_id = event["blocked_id"]

        await self.send(
            text_data=json.dumps(
                {
                    "type": "on_user_block",
                    "blocker_id": blocker_id,
                    "blocked_id": blocked_id,
                }
            )
        )

        # Safely leave the room
        await self.leave_chat(self.room_name)
        print(f"[BLOCK_USER] User blocked in room '{self.room_name}' by User ID {blocker_id}.")

    # to refactor
    @database_sync_to_async
    def get_message_list(self, messages, chat, receiver_id):
        # print sender messages as read
        print(f"receiver_id: {receiver_id}")

        return [
            {
                "id": message.id,
                "sender": "user" if message.author.id == self.user.id else "other",
                "text": message.message,
                "time": message.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
                "message_type": message.type,
                "invitation": serialize_invite(message.invitation),
            }
            for message in messages
        ]

    @database_sync_to_async
    def get_user_by_id(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_chat(self, from_user, to_user):
        chat = Chat.objects.filter(
            Q(fromUser=from_user, toUser=to_user)
            | Q(fromUser=to_user, toUser=from_user)
        ).first()
        return chat

    @database_sync_to_async
    def get_or_create_chat(self, from_user, to_user):
        chat = Chat.objects.filter(
            Q(fromUser=from_user, toUser=to_user)
            | Q(fromUser=to_user, toUser=from_user)
        ).first()
        if chat:
            return chat, False
        else:
            return Chat.objects.get_or_create(fromUser=from_user, toUser=to_user)

    @database_sync_to_async
    def get_last_20_messages(self, chat, receiver_id):
        updated_count = Message.objects.filter(
            refChat=chat, author=receiver_id, isRead=False
        ).update(isRead=True)
        print(f"updated_count: {updated_count}")
        return Message.objects.filter(refChat=chat.id).order_by("-createdAt")[:20]

    @database_sync_to_async
    def save_message(
        self, from_user, to_user, chat, message_content, message_type, is_read=False
    ):
        invited_game = None
        if message_type == 1:
            invited_game = GameInvitation.objects.create(
                from_user=from_user,
                to_user=to_user,
            )

        return Message.objects.create(
            refChat=chat,
            message=message_content,
            author=from_user,
            isRead=is_read,
            type=message_type,
            invitation=invited_game,
        )

    async def leave_chat(self, room_name):
        await self.channel_layer.group_discard(room_name, self.channel_name)
        if room_name in connected_rooms and self.user.id in connected_rooms[room_name]:
            connected_rooms[room_name].remove(self.user.id)
        print(f"[LEAVE_CHAT] User '{self.user.username}' left room '{room_name}'.")

    @database_sync_to_async
    def get_friends(self, user_id):
        # Fetch friendships where the user is involved as user or friend
        friendships = Friend.objects.filter(Q(user_id=user_id) | Q(friend_id=user_id), status=Friend.STATUS_ACCEPTED)

        # Log the raw queryset for debugging
        print(f"[DEBUG] Friendships for user {user_id}: {friendships}")

        # Extract the friends from the relationships
        friends = [f.friend if f.user.id == user_id else f.user for f in friendships]

        # Log the final list of friends
        print(
            f"[DEBUG] Friendships for user {user_id}: [{', '.join([f'{friendship.user.username} ↔ {friendship.friend.username}' for friendship in friendships])}]"
        )
        return friends


def serialize_invite(invite):
    if invite:
        return {
            "id": invite.id,
            "from_user": invite.from_user.id,
            "to_user": invite.to_user.id,
            "is_expired": invite.is_expired,
            "created_at": invite.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
    return None