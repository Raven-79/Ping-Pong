import { h, defineComponent } from "../../../lib/index.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
import { i18n } from "../../utils/i18n.js";

export const TournamentCard = defineComponent({
  props: {
    tournament: {
      type: Object,
      required: true, // Ensures the tournament data is passed
    },
  },
  render() {
    const tournament = this.props.tournament;
    const owner = tournament.owner || {}; // Safeguard in case owner data is missing
    const ownerName = this.props.tournament.owner_name || "Unknown Owner"; // Fallback for owner display name
    const availableSlots =
      tournament.max_players - tournament.participants_count; // Calculate available slots

    const ownerAvatar = this.props.tournament.owner_avatar
      ? `${BACKEND_URL}/auth${this.props.tournament.owner_avatar}`
      : "https://example.com/default-avatar.png";

    return (
      <div className="c-tournament-card p-3 m-2">
        <div className="d-flex flex-column justify-content-center gap-2 m-2">
          <div className="c-enemy-avatar d-flex justify-content-center w-100">
            <img
              src={ownerAvatar}
              alt={i18n.t("tournament.card.avatar_alt")}
              className="c-enemy-avatar"
            />
          </div>
          <span className="c-friend-name">@_{ownerName}</span>
          <h3>{tournament.name || i18n.t("tournament.card.unnamed")}</h3>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-2 w-100">
          <div className="text-start">
            <div>
              <span>{i18n.t("tournament.card.available_slots")}: </span>
              <span>{availableSlots}</span>
            </div>
            <div>
              <span>{i18n.t("tournament.card.max_slots")}: </span>
              <span>
                {tournament.max_players ||
                  i18n.t("tournament.card.not_available")}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn c-btn-danger"
              on:click={() => this.$emit("join", tournament.id)}
            >
              {i18n.t("tournament.card.join")}
            </button>
            <button
              className="btn c-btn"
              on:click={() => this.$emit("view", tournament.id)}
            >
              {i18n.t("tournament.card.view")}
            </button>
          </div>
        </div>
      </div>
    );
  },
});
