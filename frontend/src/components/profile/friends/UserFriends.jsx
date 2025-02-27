import { h, defineComponent, Fragment } from "../../../../lib/index.js";
import { FriendCard } from "./FriendCard.js";
import { NoDataMessage } from "../../common/NoDataMessage.js";
import { Load } from "../../common/Load.js";
import { myFetch, BACKEND_URL } from "../../../utils/apiRequest.js";
import { ServerError } from "../../common/ServerError.js";
import { i18n } from "../../../utils/i18n.js";

export const UserFriends = defineComponent({
  state() {
    return {
      friendsList: [],
      isLoading: false,
      hasMore: true,
      serverError: false,
    };
  },
  render() {
    if (this.state.serverError) {
      return <ServerError />;
    }
    return (
      <div className="p-1 p-lg-2 c-mach-history h-100 d-flex flex-column">
        {!this.$context.router.params.id ? (
          <div className="d-flex mb-3 p-2 mx-2 mx-lg-5 row justify-content-end">
            <div className="col-12 col-sm-6 col-lg-4">
              <select
                className="form-select c-floating-input border-0 text-center w-100 c-height-40"
                aria-label={i18n.t("friends.select_label")}
                on:change={(e) => {
                  this.requestFriends(e.target.value);
                }}
              >
                <option selected value="friends">
                  {i18n.t("friends.status.friends")}
                </option>
                <option value="pending">
                  {i18n.t("friends.status.pending")}
                </option>
                <option value="block">
                  {i18n.t("friends.status.blocked")}
                </option>
              </select>
            </div>
          </div>
        ) : (
          <></>
        )}
        {!this.state.friendsList?.length ? (
          <NoDataMessage
            iconPath="img/floating.png"
            message={i18n.t("friends.no_data")}
          />
        ) : (
          <div className="p-1 p-lg-2 c-mach-history">
            {this.state.friendsList.map((friend) => (
              <FriendCard friendInf={friend} key={friend.id} />
            ))}
          </div>
        )}
      </div>
    );
  },
  methods: {
    loadMore() {
      this.$updateState({ isLoading: true });
    },
  },
  async onMounted() {
    try {
      const userId = this.$context.router.params.id;
      if (!userId) {
        const response = await myFetch(`${BACKEND_URL}/manage/friends/`);
        if (response.ok) {
          const data = await response.json();
          this.$updateState({ friendsList: data });
        } else {
          this.$updateState({ serverError: true });
        }
      } else {
        const response = await myFetch(
          `${BACKEND_URL}/manage/friends/${userId}/`
        );
        if (response.ok) {
          const data = await response.json();
          this.$updateState({ friendsList: data });
        } else {
          this.$updateState({ serverError: true });
        }
      }
    } catch (e) {
      // console.log(e);
      this.$updateState({ serverError: true });
    }
  },
  methods: {
    async requestFriends(type) {
      this.$updateState({ isLoading: true });
      if (type === "friends") {
        const response = await myFetch(`${BACKEND_URL}/manage/friends/`);
        if (response.ok) {
          const data = await response.json();

          this.$updateState({ friendsList: data });
        } else {
          // console.log("error", response);
          this.$updateState({ serverError: true });
        }
      } else if (type === "pending") {
        const response = await myFetch(
          `${BACKEND_URL}/manage/friends/pending/`
        );
        if (response.ok) {
          const data = await response.json();

          this.$updateState({ friendsList: data });
        } else {
          // console.log("error", response);
          this.$updateState({ serverError: true });
        }
      } else {
        const response = await myFetch(
          `${BACKEND_URL}/manage/friends/blocked/`
        );
        if (response.ok) {
          const data = await response.json();

          this.$updateState({ friendsList: data });
        } else {
          // console.log("error", response);
          this.$updateState({ serverError: true });
        }
      }
    },
  },
});
