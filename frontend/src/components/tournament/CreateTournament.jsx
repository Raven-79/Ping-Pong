import { h, defineComponent } from "../../../lib/index.js";
import { notify } from "../../../lib/store.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { i18n } from "../../utils/i18n.js";

export const CreateTournament = defineComponent({
  state() {
    return {
      tournamentName: "",
      maxPlayers: 4,
    };
  },
  methods: {
    async createTournament() {
      try {
        const response = await myFetch(
          `${BACKEND_URL}/manage/tour/tournament/create/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.state.tournamentName,
              max_players: this.state.maxPlayers,
            }),
          }
        );

        console.log("response", response.ok);
        const data = await response.json();
        if (response.ok) {
          notify("success", i18n.t("tournament.create.success"));
          this.$emit("cancel");
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error creating tournament:", error);
      }
    },
  },
  render() {
    return (
      <div className="d-flex justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          <h1 className="text-center m-3">
            {i18n.t("tournament.create.title")}
          </h1>
          <div className="text-start mb-3 p-2">
            <label className="form-label ps-3">
              {i18n.t("tournament.create.name_label")}
            </label>
            <input
              type="text"
              className="form-control c-floating-input border-0 p-2"
              value={this.state.tournamentName}
              placeholder={i18n.t("tournament.create.name_placeholder")}
              on:input={(e) =>
                this.$updateState({ tournamentName: e.target.value })
              }
            />
          </div>
          <div className="text-start mb-3 p-2">
            <label className="form-label ps-3">
              {i18n.t("tournament.create.players_label")}
            </label>
            <select
              className="form-select c-floating-input border-0 p-2"
              value={this.state.maxPlayers}
              on:change={(e) =>
                this.$updateState({ maxPlayers: parseInt(e.target.value) })
              }
              aria-label={i18n.t("tournament.create.players_select_aria")}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
          </div>
          <div className="d-flex justify-content-end align-items-center mx-3">
            <button
              className="btn c-btn m-2"
              on:click={() => this.$emit("cancel")}
            >
              {i18n.t("common.cancel")}
            </button>
            <button
              className="btn c-btn-danger m-2"
              on:click={() => this.createTournament()}
            >
              {i18n.t("tournament.create.submit")}
            </button>
          </div>
        </div>
      </div>
    );
  },
});
