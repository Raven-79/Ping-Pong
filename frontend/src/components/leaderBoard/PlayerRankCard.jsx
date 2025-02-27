import { h, defineComponent } from "../../../lib/index.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
import { getUserbadge } from "../../utils/dateFormater.js";
import { i18n } from "../../utils/i18n.js";

export const PlayerRankCard = defineComponent({
  state() {
    return {
      rankigBgColor: {
        1: "rgb(var(--gold-color))",
        2: "rgb(var(--silver-color))",
        3: "rgb(var( --bronze-color))",
      },
    };
  },
  render() {
 
    return (
      <div className="mx-2 mx-lg-5  mb-3  d-flex  align-items-center  p-2  c-match-card cursor-pointer row "on:click={() => this.$context.router.navigateTo(`/profile/${this.props.playerInf.user_id}`)}>
        <div className="col-8 col-md-6 d-flex justify-content-start ">
          <div className="d-md-none  me-2  d-flex justify-content-center align-items-center ">
            <div
              className=" c-ranking-num-small d-flex justify-content-center align-items-center"
              style={{
                "background-color":
                  this.state.rankigBgColor[this.props.rank],
              }}
            >
              <p className=" m-0 ">#{this.props.rank}</p>
            </div>
            <img
              src={`${BACKEND_URL}/auth${this.props.playerInf.avatar}`}
              alt=""
              className="c-ranking-avatar-small  me-2"
            />
          </div>
          <div className="d-none d-md-inline ">
            <div className="d-flex">
              <div
                class=" c-ranking-num   d-flex justify-content-center align-items-center"
                style={{
                  "background-color":
                    this.state.rankigBgColor[this.props.rank],
                }}
              >
                <p className=" m-0 ">#{this.props.rank}</p>
              </div>
              <img
                 src={`${BACKEND_URL}/auth${this.props.playerInf.avatar}`}
                alt=""
                className="c-ranking-avatar  me-2"
              />
            </div>
          </div>
          <div className="text-start d-flex align-items-center ">
            <div>
              <div className="c-friend-name" on:click={() => this.$context.router.navigateTo(`/profile/${this.props.playerInf.user_id}`)}>
                {`@${this.props.playerInf.display_name}`}
              </div>
              <div className="d-none d-md-inline">
                <img src={getUserbadge(this.props.playerInf.level)}
                 className="img c-ranking-badge" />
              </div>
            </div>
          </div>
        </div>
        <div className="d-none d-md-inline col-4  ">
          <div className="d-flex justify-content-around">
            <div>
              <p className=" m-0 "> {this.props.playerInf.total_games}</p>
              <p className=" m-0 c-ranking-titles">{i18n.t("leaderboard.matchesPlayed")}</p>
            </div>
            <div>
            <p className=" m-0 "> {this.props.playerInf.wins}</p>
            <p className=" m-0 c-ranking-titles">{i18n.t("leaderboard.wins")}</p>
             </div>
          </div>
        </div>
        <div className="col-4 col-md-2">
          <p className=" m-0 "> {this.props.playerInf.level}</p>
          <p className=" m-0 c-ranking-titles">{i18n.t("profile.level")}</p>
        </div>
      </div>
    );
  },
});
