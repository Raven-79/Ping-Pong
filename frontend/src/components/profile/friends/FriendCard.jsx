import { h, defineComponent } from "../../../../lib/index.js";
import { BACKEND_URL } from "../../../utils/apiRequest.js";
import { getUserbadge } from "../../../utils/dateFormater.js";
export const FriendCard = defineComponent({
  render() {
    // console.log("FriendCard" , this.props.friendInf.profile);
    return (
      <div
        className="mx-2 mx-lg-5  c-match-card mb-3  d-flex align-items-center cursor-pointer p-2 row"
        on:click={() =>
          this.$context.router.navigateTo(`/profile/${this.props.friendInf.id}`)
        }
      >
        <div className="col-10 d-flex justify-content-start">
          <div>
            <img
              src={`${BACKEND_URL}/auth${this.props.friendInf.profile.avatar}`}
              alt=""
              className="c-enemy-avatar  me-2"
            />
          </div>
          <div className="text-start">
            <div
              className="c-friend-name"
              on:click={() =>
                this.$context.router.navigateTo(
                  `/profile/${this.props.friendInf.id}`
                )
              }
            >
              {this.props.friendInf.profile.first_name}{" "}
              {this.props.friendInf.profile.last_name}
            </div>
            <div
              className="c-display-name"
              on:click={() =>
                this.$context.router.navigateTo(
                  `/profile/${this.props.friendInf.id}`
                )
              }
            >{`@${this.props.friendInf.profile.display_name}`}</div>
          </div>
        </div>
        <div className="col-2  d-flex justify-content-end  h-100">
          <div>
            <div className="c-friend-list-badge">
              <img src={getUserbadge(this.props.friendInf.profile.level)}
              className="img-fluid h-100 w-100" />
            </div>
          </div>
          
        </div>
      </div>
    );
  },
});
