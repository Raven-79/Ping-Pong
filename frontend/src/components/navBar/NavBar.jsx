import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { SearchBar } from "./SearchBar.js";
import { SideBar } from "./SideBar.js";
import { NavBarTop } from "./NavBarTop.js";
import { Store, notify } from "../../../lib/store.js";
import {chatWebSocketManager }from "../../utils/WebSocket.js";

export const NavBar = defineComponent({
  render() {
    return (
      <div>
        {/* <NavBarTop userInf={this.props.userInf} /> */}
        <NavBarTop
          on:logout={() => this.$emit("logout")}
          userImg={this.props.userImg}
        />

        {/* <SearchBar /> */}
      </div>
    );
  },
  async onMounted() {
    await chatWebSocketManager.connect();
    this.notifeCallback = (data) => this.notifyForGameInvitation(data);

    chatWebSocketManager.subscribe("chat_message", this.notifeCallback);
  },
  methods: {
    notifyForGameInvitation(data) {
      if (data.message_type === 1 && data.sender_id !== Store.userData.user) {
        notify("info", "You have a new invitation");
      }
    },
  },
});
