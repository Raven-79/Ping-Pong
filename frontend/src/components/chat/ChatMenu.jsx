import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { ChatPreview } from "./ChatPreview.js";

export const ChatMenu = defineComponent({
  render() {
    const { conversations, activeUser } = this.props; 
    
    // Modified to handle full datetime string
    const timeStringToDate = (timeStr) => {
      return new Date(timeStr);
    };

    const sortedConversations = [...conversations].sort((a, b) => {
      const timeA = timeStringToDate(a.lastMessage.time);
      const timeB = timeStringToDate(b.lastMessage.time);
      return timeB - timeA;
    });

    return (
      <div className="h-100 overflow-auto hidden-scrollbar mb-2 c-chat-menu-bg">
        {sortedConversations.map((conversation) => (
          <div
            className="c-chat-card px-2"
            on:click={() => {
              this.$emit("conversationSelected", {
                conversation,
                userId: conversation.friend_id,
              });
            }}
          >
            <ChatPreview chatData={conversation} activeUser={activeUser} />
          </div>
        ))}
        <div className="c-chat-card-empty"></div>
      </div>
    );
  },
});