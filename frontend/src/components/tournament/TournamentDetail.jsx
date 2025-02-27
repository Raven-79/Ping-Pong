import { h, defineComponent } from "../../../lib/index.js";
import { TournamentRounds } from "./TournamentRounds.js";
import { TournamentLobby } from "./TournamentLobby.js";
import { TournamentTemplate4 } from "./TournamentTemplate4.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { tournamentWebSocketManager } from "../../utils/WebSocket.js";
import { notify } from "../../../lib/store.js";
import { i18n } from "../../utils/i18n.js";


export const TournamentDetail = defineComponent({
  state() {
    return {
      tournamentDetail: null,
      participants: [],
      loading: true,
      error: null,
      showRounds: false,
      tournamentLastDaitails: null,
    };
  },
  async onMounted() {
    const tournamentId = this.props.id;
    if (!tournamentId) {
      console.error("Tournament ID is missing!");
      this.$updateState({
        error: i18n.t("tournament.detail.errors.missing_id"),
        loading: false,
      });
      return;
    }

    try {
      const response = await myFetch(
        `${BACKEND_URL}/manage/tour/tournament/${tournamentId}/matches/`
      );
      if (!response.ok) {
        throw new Error(
          i18n.t("tournament.detail.errors.fetch_error", {
            status: response.statusText,
          })
        );
      }
      const data = await response.json();
      if (!data.tournament || !data.participants) {
        throw new Error(i18n.t("tournament.detail.errors.incomplete_data"));
      }

      this.$updateState({
        tournamentDetail: {
          ...data.tournament,
          max_slots: data.tournament.max_players || 0,
        },
        participants: data.participants || [],
        loading: false,
        isCompleted: data.is_completed,
        winner: data.winner,
        tournamentLastDaitails: data,
      });
      const id = this.$context.router.params.id;

      await tournamentWebSocketManager.connect();

      tournamentWebSocketManager.socket.send(
        JSON.stringify({
          type: "view_tournament",
          tournament_id: id || data.tournament.id,
        })
      );

      this.participantListCallBack = (data) => this.update_participants(data);

      this.handleNotAllowedCallBack = (data) => this.handleNotAllowed(data);

      // Use stored references for subscribing
      tournamentWebSocketManager.subscribe(
        "participant_list",
        this.participantListCallBack
      );

      tournamentWebSocketManager.subscribe(
        "not_allowed",
        this.handleNotAllowedCallBack
      );

      if (
        id &&
        this.state.participants.length === data.tournament.max_players
      ) {
        await this.startTournament(id);
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
      this.$updateState({
        loading: false,
        error: i18n.t("tournament.detail.errors.load_failed"),
      });
    }
  },
  onUnmounted() {
    tournamentWebSocketManager.unsubscribe(
      "participant_list",
      this.participantListCallBack
    );

    tournamentWebSocketManager.unsubscribe(
      "not_allowed",
      this.handleNotAllowedCallBack
    );
    tournamentWebSocketManager.close();
    this.participantListCallBack = null; // Clear the callback reference
    this.handleNotAllowedCallBack = null; // Clear the callback reference
  },
  methods: {
    handleNotAllowed(data) {
      // console.log(data.message);
      this.$context.router.navigateTo("/");
    },
    update_participants(data) {
      // console.log({ participant_list: data.player_list });
      this.$updateState({
        participants: data.player_list.map((participant) => ({
          ...participant,
          displayName: participant.user.display_name || "Unknown Player",
        })),
      });
    },

    viewTournamentWinner(winner) {
      this.$emit("viewWinner", winner);
    },
    async startTournament(tournamentId) {
      try {
        const matchesResponse = await myFetch(
          `${BACKEND_URL}/manage/tour/tournament/${tournamentId}/matches/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const matchesData = await matchesResponse.json();

        if (matchesResponse.ok && Object.keys(matchesData.rounds).length > 0) {
          // console.log(i18n.t("tournament.detail.logs.matches_exist"));
          this.$updateState({ showRounds: true });
          return;
        }

        const response = await myFetch(
          `${BACKEND_URL}/manage/tour/tournament/${tournamentId}/start/`,
          {
            method: "POST",
          }
        );

        const data = await response.json();
        if (response.ok) {
          // console.log(
          //   i18n.t("tournament.detail.logs.tournament_started"),
          //   data
          // );
          notify(
            "success",
            i18n.t("tournament.detail.notifications.start_success")
          );
          this.$updateState({ showRounds: true });
        } else {
          console.error(
            i18n.t("tournament.detail.logs.start_failed"),
            data.error
          );
          notify("error", i18n.t("tournament.detail.errors.start_error"));
          // alert(
          //   i18n.t("tournament.detail.errors.start_error", {
          //     error: data.error,
          //   })
          // );
        }
      } catch (error) {
        console.error(i18n.t("tournament.detail.logs.start_error"), error);
        notify("error", i18n.t("tournament.detail.errors.network_error"));
        // alert(i18n.t("tournament.detail.errors.network_error"));
      }
    },
  },
  render() {
    const {
      tournamentDetail,
      loading,
      participants,
      error,
      showRounds,
      isCompleted,
      winner,
    } = this.state;

    if (loading) {
      return (
        <div className="loading">{i18n.t("tournament.detail.loading")}</div>
      );
    }

    if (!tournamentDetail) {
      return (
        <div className="loading">{i18n.t("tournament.detail.loading")}</div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (isCompleted) {
      // console.log({ winner });
      return (
        <TournamentTemplate4
          tournamentWinner={winner}
          tournamentLastDaitails={this.state.tournamentLastDaitails}
          on:back={() => this.$emit("return")}
        />
      );
    }

    const availableSlots = tournamentDetail.max_slots - participants.length;

    return (
      <div className="tournament-details-container p-4">
        <h2>
          {i18n.t("tournament.detail.lobby_title")}:{" "}
          {tournamentDetail.name || i18n.t("tournament.detail.unnamed")}
        </h2>
        <p>
          {i18n.t("tournament.detail.available_slots", {
            count: availableSlots,
          })}
        </p>

        {showRounds ? (
          <TournamentRounds
            tournamentId={this.props.id}
            onTournamentWinner={(winner) => this.viewTournamentWinner(winner)}
          />
        ) : (
          <TournamentLobby
            participants={participants}
            maxSlots={tournamentDetail?.max_slots}
            onStart={() => this.startTournament(this.props.id)}
          />
        )}

        <button
          className="btn c-btn mt-4"
          onClick={() => {
            this.$emit("back");
          }}
        >
          {i18n.t("tournament.detail.back_button")}
        </button>
      </div>
    );
  },
});
