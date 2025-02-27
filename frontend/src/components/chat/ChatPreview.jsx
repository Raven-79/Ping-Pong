import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
import { formatDate } from "../../utils/dateFormater.js";

export const ChatPreview = defineComponent({
  render() {
    console.log("chat data",this.props.chatData);
    return (
      <div
        className={`h-100 w-100 ${
          this.props.activeUser == this.props.chatData.friend_id
            ? "c-chat-preview-active"
            : "c-chat-preview "
        } p-2 d-flex justify-content-around align-items-center my-2 `}
      >
        <div className="h-100  d-flex justify-content-around align-items-center position-relative">
          <img
            src={`${BACKEND_URL}/auth${this.props.chatData.avatar}`}
            className="c-chat-img "
          />
          {this.props.chatData.isOnline ? (
            <div className="position-absolute c-chat-m-isonline">
              <i class="fa-solid fa-circle me-1"></i>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="h-100 d-none d-lg-inline ms-2 flex-grow-1 d-none d-lg-block  c-chat-name-box">
          <div className="h-100  d-flex align-items-start flex-column justify-content-center ms-1">
            <div>{this.props.chatData.name}</div>
            <div className="c-last-msg">
              {this.lastMessageShortner(this.props.chatData.lastMessage.text)}
            </div>
          </div>
        </div>
        <div className="h-100   d-none d-lg-block ">
          <div className="h-100 d-flex align-items-end flex-column justify-content-center ">
            <div className="c-msg-time mb-1">
              {this.props.chatData.lastMessage &&
              this.props.chatData.lastMessage.time
                ? formatDate(new Date(this.props.chatData.lastMessage.time))
                : ""}
            </div>
            {this.props.chatData.unreadMessages > 0 ? (
              <div className="c-unread-msg rounded-circle position-relative">
                <div className="position-absolute top-50 start-50 translate-middle">
                  {this.props.chatData.unreadMessages}
                </div>
              </div>
            ) : (
              <div className="c-unread-msg-empty rounded-circle"></div>
            )}
          </div>
        </div>
      </div>
    );
  },
  methods: {
    lastMessageShortner(message) {
      return message.length < 25 ? message : message.substring(0, 22) + "...";
    },
  },
});
