import { h, defineComponent } from "../../../lib/index.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { TournamentCard } from "./TournamentCard.js";
import { TournamentTemplate16 } from "./TournamentTemplate16.js";

export const TournamentsDisplay = defineComponent({
  state: () => ({
    tournaments: [], // List of tournaments
    error: null, // Error message if API call fails
  }),
  async onMounted() {
    try {
      const response = await myFetch(
        `${BACKEND_URL}/manage/tour/tournament/list/`
      );
      if (!response.ok) {
        throw new Error(`Error fetching tournaments: ${response.statusText}`);
      }
      const data = await response.json();
      this.$updateState({ tournaments: data });
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      this.$updateState({ error: error.message });
    }
  },
  render() {
    const { tournaments, error } = this.state;

    if (error) {
      return <div className="error-message">Error: {error}</div>;
    }

    if (tournaments.length === 0) {
      return (
        <div className="no-tournaments-message h-100 d-flex flex-column justify-content-center align-items-center">
          <img src="./img/no-tourn.png" alt="" className=" c-tourn-icon my-4" />
            <div className="mb-3">
              <h3>No tournaments are currently available.</h3>
            </div>
        </div>
      );
    }

    return (
      <div className="h-100 row mx-4 justify-content-center">
        {tournaments.map((tournament) => (
          <div
            className="col-12 col-md-6 col-lg-4 col-xl-3"
            key={tournament.id}
          >
            <TournamentCard
              tournament={tournament}
              on:join={() => this.$emit("join", tournament.id)}
              on:view={() => this.$emit("view", tournament.id)}
            />
          </div>
        ))}
      </div>
    );
  },
});
