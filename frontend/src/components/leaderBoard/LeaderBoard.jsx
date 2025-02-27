import { h, defineComponent, Fragment } from "../../../lib/index.js";
import { NoDataMessage } from "../common/NoDataMessage.js";
import { PlayerRankCard } from "./PlayerRankCard.js";
import { Load } from "../common/Load.js";
import { Spinner } from "../common/Spiner.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";
import { i18n } from "../../utils/i18n.js";
import { ServerError } from "../common/ServerError.js";

export const LeaderBoard = defineComponent({
  state() {
    return {
      leaderboard: [],
      isLoading: true,
      serverError: false,
    };
  },
  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }
    if (this.state.serverError) {
      return <ServerError />;
    }
    if (this.state.leaderboard.length === 0)
      return (
        <div className="h-100">
          <NoDataMessage
            iconPath="img/empty-state.png"
            message="Play and you’ll be here !"
          />
        </div>
      );
    return (
      <div className="h-100 d-flex flex-column ">
        <div className="my-3 flex-shrink-1">
          <h1 className="m-0">{i18n.t("leaderboard.title")}</h1>
        </div>
        <div className="flex-grow-1 overflow-auto hidden-scrollbar">
          <div className="mt-3">
            {this.state.leaderboard.map((player, index) => (
              <PlayerRankCard playerInf={player} key={index} rank={index + 1} />
            ))}
          </div>
        </div>
      </div>
    );
  },
  async onMounted() {
    const response = await myFetch(`${BACKEND_URL}/manage/dashboard/`);
    if (response.status == 200) {
      const data = await response.json();
      this.$updateState({ leaderboard: data, isLoading: false });
      // console.log("Ranking:",data);
    } else {
      this.$updateState({ isLoading: false , serverError: true });
      // console.log("error");
    }
  },

  methods: {},
});
