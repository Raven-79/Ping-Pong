import { h, defineComponent,Fragment } from "../../../lib/index.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";

export const TournamentPlayerCard = defineComponent({
  render() {
    const { userData, winner } = this.props;
    return (
      <div
        className={`c-tplayer-card d-flex cursor-pointer m-2 p-2 position-relative`}
        style={{
          "border-color": winner ? "rgb(var(--gold-color))" : undefined,
        }}
        on:click={() =>
          this.$context.router.navigateTo(`/profile/${this.props.userData.id}`)
        }
      >
        <div className="me-lg-2 ">
          <img
            src={`${BACKEND_URL}/auth${userData.avatar}`}
            className="img-fluid  c-img"
            style={{
              height: winner ? "70px" : "50px",
              width: winner ? "70px" : "50px",
            }}
            // alt={userData.username || "Player"}
          />
        </div>
        <div className="d-none d-lg-flex flex-column justify-content-start text-start">
          <div className="c-friend-name">{this.props.userData.display_name}</div>
        </div>
        {this.props.isEliminated ? (
          <div className="position-absolute top-0 start-0 c-elim-effect w-100 h-100"></div>
        ) : (
          <></>
        )}
        {this.props.winner ? (
          <div className="position-absolute c-winner-effect">
            <i className="fa-solid fa-crown"></i>
            {/* <div className="c-winner-name">{this.props.userData.username}</div> */}
          </div>
        ):(<></>)}
      </div>
    );
  },
});
