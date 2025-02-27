import { ChatMenu } from "./ChatMenu.js";
import { ConversationBox } from "./ConversationBox.js";
import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { refresh } from "../../utils/apiRequest.js";
import { chatWebSocketManager } from "../../utils/WebSocket.js";
import { i18n } from "../../utils/i18n.js";


export const Chat = defineComponent({
  state() {
    return {
      conversations: [], // Conversations from the backend
      activeUser: null, // Active user ID
      activeConversation: null,
      loading: true, // Loading state
      error: null, // Error state
      socketConnected: false,
      serverError: false,
    };
  },
  onUnmounted() {
    // console.log("wow how");
    chatWebSocketManager.unsubscribe(
      "friend_status_update",
      this.friendStatusUpdateCallback
    );
    chatWebSocketManager.unsubscribe(
      "initial_status",
      this.initialStatusCallback
    );
    chatWebSocketManager.unsubscribe("chat_message", this.chatMessageCallback);

    //  chatWebSocketManager.close();
  },
  async onMounted() {
    // console.log("yikes");

    try {
      const response = await myFetch(
        `${BACKEND_URL}/manage/chat/api/conversations/`
      );

      if (response.ok) {
        const data = await response.json();
        const urlUserId = this.$context.router.params.id;
        // console.log("a- ", this.$context.router.params.id);
        // console.log("b- ", data);
        const selectedConv = data.find(
          (conv) => conv.friend_id == this.$context.router.params.id
        );
        this.$updateState({
          conversations: data,
          activeConversation: selectedConv ?? null,
          activeUser: urlUserId ? parseInt(urlUserId) : null,
          loading: false,
        });
      } else {
        this.$updateState({
          loading: false,
          serverError: true,
        });
        throw new Error("Failed to fetch conversations");
      }

      await chatWebSocketManager.connect();

      this.friendStatusUpdateCallback = (data) =>
        this.updateOnlineStatus([data.friend_update]);
      this.initialStatusCallback = (data) =>
        this.updateOnlineStatus(data.friend_list);
      this.chatMessageCallback = (data) => this.handleMessage(data);

      // Use stored references for subscribing
      chatWebSocketManager.subscribe(
        "friend_status_update",
        this.friendStatusUpdateCallback
      );
      chatWebSocketManager.subscribe(
        "initial_status",
        this.initialStatusCallback
      );
      chatWebSocketManager.subscribe("chat_message", this.chatMessageCallback);
      this.$updateState({ socketConnected: true });

      if (chatWebSocketManager.socket) {
        console.log("Requesting initial status from the server...");
        chatWebSocketManager.socket.send(
          JSON.stringify({
            type: "initial_status_request",
          })
        );
      } else {
        console.warn(
          "Socket is not connected. Initial status request skipped."
        );
      }
    } catch (error) {
      console.error("Error in Chat component:", error);
      this.$updateState({
        error: error.message,
        loading: false,
      });
    }
  },
  methods: {
    onBlock() {
      const activeConversationId = this.state.activeConversation?.id;

      if (!activeConversationId) {
        console.warn("No active conversation to block.");
        return;
      }

      const updatedConversations = this.state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            isBlocked: true,
          };
        }
        return conv;
      });

      const updatedActiveConversation = {
        ...this.state.activeConversation,
        isBlocked: true,
      };

      this.$updateState({
        conversations: updatedConversations,
        activeConversation: updatedActiveConversation,
      });
    },
    handleConversationSelected({ conversation, userId }) {
      this.$context.router.navigateTo(`/chat/${userId}`);

      const updatedConversations = [...this.state.conversations];
      const targetConversation = updatedConversations.find(
        (conv) => conv.id === conversation.id
      );

      if (targetConversation) {
        targetConversation.unreadMessages = 0; // Reset unread messages for the selected conversation
      }

      this.$updateState({
        activeUser: userId,
        activeConversation: targetConversation,
        conversations: updatedConversations,
      });
      // console.log("handleConversationSelected activeUser: ", this.state.activeUser);
    },
    updateOnlineStatus(updates) {
      const updatedConversations = this.state.conversations.map(
        (conversation) => {
          const update = updates.find(
            (u) => u.user_id === conversation.friend_id
          );
          if (update) {
            return {
              ...conversation,
              isOnline: update.status === "online",
            };
          }
          return conversation;
        }
      );
      const updatedActiveConversation =
        this.state.activeConversation &&
        updatedConversations.find(
          (conversation) => conversation.id === this.state.activeConversation.id
        );

      this.$updateState({
        conversations: updatedConversations,
        activeConversation:
          updatedActiveConversation || this.state.activeConversation,
      });
    },
    handleMessage(data) {
      const chat_id = data.chat_id;
      const sender = data.sender;
      const lastMessage = {
        text: data.message,
        time: data.time,
      };

      const inc = this.state.activeUser ? 0 : 1;

      const updatedConversations = this.state.conversations.map(
        (conversation) =>
          conversation.id === chat_id
            ? {
                ...conversation,
                lastMessage,
                unreadMessages: (conversation.unreadMessages || 0) + inc,
              }
            : conversation
      );

      const updatedActiveConversation =
        this.state.activeConversation &&
        updatedConversations.find(
          (conversation) => conversation.id === this.state.activeConversation.id
        );

      this.$updateState({
        conversations: updatedConversations,
        activeConversation: updatedActiveConversation, // remove if it breaks anything
      });
    },
  },
  render() {
    const { conversations, activeConversation, activeUser, loading, error } =
      this.state;
    if (this.state.serverError) {
      return <ServerError />;
    }
    return (
      <div className="h-100 d-flex flex-row">
        {/* Sidebar */}
        <div className="h-100">
          {loading ? (
            <p>{i18n.t("chat.loading")}</p>
          ) : error ? (
            <p>{i18n.t("chat.error", { error: error })}</p>
          ) : (
            <ChatMenu
              activeUser={activeUser}
              conversations={conversations}
              on:conversationSelected={this.handleConversationSelected}
            />
          )}
        </div>
        <div className="h-100 flex-grow-1">
          {this.state.activeConversation === null ||
          !this.state.socketConnected ? (
            <div className="h-100 d-flex flex-column justify-content-center align-items-center">
              <img
                src="./img/empty-messages.png"
                className="c-empty-messages-img"
                alt={i18n.t("chat.empty_messages_alt")}
              />
              <h3>{i18n.t("chat.start_message")}</h3>
            </div>
          ) : (
            <ConversationBox
              key={activeConversation?.id}
              activeUser={activeUser}
              conversation={activeConversation}
              on:onBlock={() => this.onBlock()}
            />
          )}
        </div>
      </div>
    );
  },
});
