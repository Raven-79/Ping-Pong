import { h, defineComponent, Fragment } from "../../../../lib/index.js";
import { NoDataMessage } from "../../common/NoDataMessage.js";
import { MatchCard } from "./MatchCard.js";
import { Load } from "../../common/Load.js";
import { myFetch, BACKEND_URL } from "../../../utils/apiRequest.js";
import { ServerError } from "../../common/ServerError.js";
import { i18n } from "../../../utils/i18n.js";

export const MatchHistory = defineComponent({
  state() {
    return {
      matchHistory: [],
      filteredMatchHistory: [],
      isLoading: false,
      serverError: false,
    };
  },
  render() {
    if (this.state.serverError) {
      return <ServerError />;
    }
    if (!this.state.matchHistory?.length)
      return (
        <NoDataMessage
          iconPath="img/space.png"
          message={i18n.t("match_history.no_matches")}
        />
      );
    return (
      <div>
        <div className="d-flex mb-3 p-2 mx-2 mx-lg-5 row justify-content-end">
          <div className="col-12 col-sm-6 col-lg-4">
            <select
              className="form-select c-floating-input border-0 text-center w-100 c-height-40"
              aria-label={i18n.t("match_history.filter_label")}
              on:change={(e) => {
                this.filterHistory(e.target.value);
              }}
            >
              <option selected value="All">
                {i18n.t("match_history.filter.all")}
              </option>
              <option value="Pong">
                {i18n.t("match_history.filter.pong")}
              </option>
              <option value="TicTacToe">
                {i18n.t("match_history.filter.tic_tac_toe")}
              </option>
            </select>
          </div>
        </div>
        <div className="p-2 p-lg-3 c-mach-history">
          {this.state.filteredMatchHistory.map((match) => (
            <MatchCard matchInfo={match} key={match.id} />
          ))}
        </div>
      </div>
    );
  },
  async onMounted() {
    // console.log("onMounted");

    const userId = this.$context.router.params.id;
    if (!userId) {
      const response = await myFetch(`${BACKEND_URL}/manage/game-history/`);
      if (response.ok) {
        const data = await response.json();
        // console.log("data", data);
        this.$updateState({
          matchHistory: data,
          filteredMatchHistory: data,
        });
      } else {
        this.$updateState({ serverError: true });
      }
    } else {
      const response = await myFetch(
        `${BACKEND_URL}/manage/game-history/${userId}/`
      );
      if (response.ok) {
        const data = await response.json();
        this.$updateState({
          matchHistory: data,
          filteredMatchHistory: data,
        });
      } else {
        this.$updateState({ serverError: true });
      }
    }
  },
  methods: {
    filterHistory(key) {
      // console.log("filterHistory");
      if (key === "All") {
        this.$updateState({
          filteredMatchHistory: this.state.matchHistory,
        });
      } else if (key === "Pong") {
        const filtered = this.state.matchHistory.filter(
          (match) => match.game_mode === "Pong"
        );
        this.$updateState({ filteredMatchHistory: filtered });
      } else if (key === "TicTacToe") {
        const filtered = this.state.matchHistory.filter(
          (match) => match.game_mode === "TicTacToe"
        );
        this.$updateState({ filteredMatchHistory: filtered });
      }
    },
  },
});
