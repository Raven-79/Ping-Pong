import {
  h,
  Fragment,
  defineComponent,
} from "../../../lib/index.js";
import { notify } from "../../../lib/store.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { i18n } from "../../utils/i18n.js";
import {chatWebSocketManager} from "../../utils/WebSocket.js";

export const ChatHeade = defineComponent({
  methods: {
      async blockUser() {
          const response = await myFetch(
              `${BACKEND_URL}/manage/friends/block/`,
              {
                  method: "PUT",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      friend_id: this.props.userInf.friend_id,
                  }),
              }
          );
          if (response.ok) {
              console.log("user blocked");
              // this.$emit("blockUser");
              if (chatWebSocketManager.socket) {
                chatWebSocketManager.socket.send(
                      JSON.stringify({
                          type: "block_user",
                          friend_id:
                              this.props.userInf.friend_id,
                      })
                  );
              }

              notify(
                  "success",
                  i18n.t("profile.notifications.userBlocked")
              );
          } else {
              console.log("Failed to block user");
              notify(
                  "error",
                  i18n.t(
                      "profile.notifications.userBlockedError"
                  )
              );
          }
      },
  },
  render() {
      return (
          <div className="c-chat-header m-2 d-flex justify-content-between align-items-center p-2">
              <div className=" d-flex justify-content-around align-items-center">
                  <div className="d-flex justify-content-center align-items-center">
                      <img
                          src={`${BACKEND_URL}/auth${this.props.userInf.avatar}`}
                          className=" c-img "
                      />
                  </div>
                  <div className="d-flex flex-column align-items-start">
                      <div
                          className="ms-2 cursor-pointer"
                          on:click={() =>
                              this.$context.router.navigateTo(
                                  `/profile/${this.props.userInf.friend_id}`
                              )
                          }
                      >
                          {this.props.userInf.userName}
                      </div>
                      {this.props.userInf.isOnline ? (
                          <div className="ms-2 c-is-online d-flex justify-content-between align-items-center">
                              <i class="fa-solid fa-circle me-1"></i>{" "}
                              <div>Online</div>
                          </div>
                      ) : (
                          <div className="ms-2 "></div>
                      )}
                  </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                  <div
                      className="me-3 fs-4 c-chat-icon"
                      on:click={() =>
                          this.$emit("sendInvitation")
                      }
                  >
                      <i class="fa-solid fa-gamepad"></i>
                  </div>
                  <div
                      className="me-2 fs-5 c-chat-icon"
                      on:click={this.blockUser}
                  >
                      <i class="fa-solid fa-ban"></i>
                  </div>
              </div>
          </div>
      );
  },
});
