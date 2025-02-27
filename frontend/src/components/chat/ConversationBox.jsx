import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { ChatHeade } from "./ChatHeade.js";
import { ChatInput } from "./ChatInput.js";
import { SentMessage } from "./SentMessage.js";
import { SentInvitation } from "./SentInvitation.js";
import { ReceivedMessage } from "./ReceivedMessage.js";
import { ReceivedInvitation } from "./ReceivedInvitation.js";
import { myFetch, refresh } from "../../utils/apiRequest.js";
import  { chatWebSocketManager} from "../../utils/WebSocket.js";
import { notify } from "../../../lib/store.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";

export const ConversationBox = defineComponent({
  state() {
    return {
      messages: [],
      loading: true,
      error: null,
      shouldScrollToBottom: true,
    };
  },
  render() {
    const { messages, loading, error } = this.state;
    const { conversation } = this.props;

    if (conversation.isBlocked) {
      return (
        <div className="h-100 d-flex justify-content-center align-items-center">
          <img
            src="./img/blocked_by.png"
            alt=""
            class="img c-blocked-img  h-150"
          />
        </div>
      );
    }
    return (
      <div className="h-100 d-flex flex-column">
        <ChatHeade
          userInf={{
            friend_id: conversation.friend_id,
            avatar: conversation.avatar,
            userName: conversation.name,
            isOnline: conversation.isOnline,
          }}
          on:sendInvitation={() => this.sendInvitation()}
          // on:blockUser={() => this.onUserBlock()}
        />

        <div
          className="c-chat-messages hidden-scrollbar flex-grow-1 overflow-auto mx-2"
          id="chat-container"
        >
          {loading ? (
            <p>Loading messages...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <div className="h-100 d-flex flex-column">
              <div className="flex-grow-1"></div>
              {messages.map((message) =>
                message.sender === "user" ? (
                  message.message_type === 0 ? (
                    <SentMessage
                      message={{
                        text: message.text,
                        time: message.time,
                      }}
                    />
                  ) : (
                    <SentInvitation
                      message={message}
                      on:acceptInvitation={() => this.acceptInvitation(message)}
                    />
                  )
                ) : message.message_type === 0 ? (
                  <ReceivedMessage
                    message={{
                      text: message.text,
                      time: message.time,
                    }}
                  />
                ) : (
                  <ReceivedInvitation
                    message={message}
                    on:acceptInvitation={() => this.acceptInvitation(message)}
                  />
                )
              )}
            </div>
          )}
        </div>
        {conversation.isBlocked ? (
          <></>
        ) : (
          <ChatInput
            on:onSendMessage={(content) => this.sendMessage(content)}
          />
        )}
      </div>
    );
  },
  methods: {
    scrollToBottom() {
      const messageContainer = document.getElementById("chat-container");
      if (messageContainer && this.state.shouldScrollToBottom) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    },
    handleScroll() {
      const messageContainer = document.getElementById("chat-container");
      if (messageContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messageContainer;
        this.state.shouldScrollToBottom =
          scrollHeight - scrollTop - clientHeight < 100;
      }
    },
    async sendInvitation() {
      const { activeUser } = this.props;

      if ( chatWebSocketManager.socket) {
        const messagePayload = {
          type: "chat",
          receiver_id: activeUser,
          message: "Game invitation",
          message_type: "invitation",
        };

         chatWebSocketManager.socket.send(JSON.stringify(messagePayload));
        this.state.shouldScrollToBottom = true;
        setTimeout(() => this.scrollToBottom(), 0);
      }
    },
    onUserBlock(data) {
      const { conversation } = this.props;
      const { blocker_id, blocked_id } = data;

      if (
        conversation.friend_id !== blocker_id &&
        conversation.friend_id !== blocked_id
      ) {
        return;
      }

      this.$updateState({
        messages: [],
      });
      this.$emit("onBlock", {});
    },
    async sendMessage(content) {
      const { activeUser } = this.props;

      if ( chatWebSocketManager.socket && content.trim()) {
        const messagePayload = {
          type: "chat",
          receiver_id: activeUser,
          message: content,
          message_type: "text",
        };

         chatWebSocketManager.socket.send(JSON.stringify(messagePayload));
        this.state.shouldScrollToBottom = true;
        setTimeout(() => this.scrollToBottom(), 0);
      }
    },
    async handleNewMessage(data) {
      const { activeUser } = this.props;
      const newMessage = {
        sender: data.sender_id === activeUser ? "other" : "user",
        text: data.message,
        time: data.time,
        message_type: data.message_type,
        invitation: data.invitation,
      };

      this.$updateState({
        messages: [...this.state.messages, newMessage],
      });
      setTimeout(() => this.scrollToBottom(), 0);
    },
    async loadPrevMessages(data) {
      const reversedMessages = [...data.messages].reverse();
      this.$updateState({
        messages: reversedMessages,
        shouldScrollToBottom: true,
      });
      setTimeout(() => this.scrollToBottom(), 0);
    },
    async acceptInvitation(message) {
      console.log("Accepting invitation", message);
      const isWithinTenMinutes =
        Date.parse(message.invitation.created_at) + 10 * 60 * 1000 > Date.now();
      console.log(
        "Date.parse(message.invite.created_at)",
        Date.parse(message.invitation.created_at)
      );
      console.log("Date.now()", Date.now());
      console.log("isWithinTenMinutes", isWithinTenMinutes);
      if (!message.invitation?.is_expired && isWithinTenMinutes) {
        notify("error", "This invitation has expired.");
        return;
      }
      this.$context.router.navigateTo(`/game/${message.invitation.id}`);
    },
  },
  async onMounted() {
    const { conversation, activeUser } = this.props;

    try {
      const response = await myFetch(
        `${BACKEND_URL}/manage/chat/api/messages/${conversation.id}/`
      );

      if (response.ok) {
        const data = await response.json();

        this.$updateState({
          messages: data,
          loading: false,
        });

        setTimeout(() => this.scrollToBottom(), 0);
      } else {
        throw new Error("Failed to fetch messages");
      }

      const messageContainer = document.getElementById("chat-container");
      if (messageContainer) {
        messageContainer.addEventListener("scroll", () => this.handleScroll());
      }

      this.newMessageCallback = (data) => this.handleNewMessage(data);

      this.prevMessagesCallback = (data) => this.loadPrevMessages(data);

       chatWebSocketManager.subscribe("chat_message", this.newMessageCallback);
       chatWebSocketManager.subscribe(
        "load_previous_messages",
        this.prevMessagesCallback
      );

      this.onUserBlockCallBack = (data) => this.onUserBlock(data);

       chatWebSocketManager.subscribe("on_user_block", this.onUserBlockCallBack);

       chatWebSocketManager.socket.send(
        JSON.stringify({
          type: "join_chat",
          receiver_id: activeUser,
        })
      );
    } catch (error) {
      this.$updateState({
        error: error.message,
        loading: false,
      });
    }
  },
  onUnmounted() {
     chatWebSocketManager.unsubscribe("chat_message", this.newMessageCallback);
     chatWebSocketManager.unsubscribe(
      "load_previous_messages",
      this.prevMessagesCallback
    );

     chatWebSocketManager.unsubscribe("on_user_block", this.onUserBlockCallBack);

    const messageContainer = document.getElementById("chat-container");
    if (messageContainer) {
      messageContainer.removeEventListener("scroll", () => this.handleScroll());
    }

    if ( chatWebSocketManager.socket) {
       chatWebSocketManager.socket.send(
        JSON.stringify({
          type: "leave_chat",
        })
      );
    }
  },
});