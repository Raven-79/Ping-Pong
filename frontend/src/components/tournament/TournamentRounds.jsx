import { h, defineComponent } from "../../../lib/index.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { tournamentWebSocketManager } from "../../utils/WebSocket.js";

export const TournamentRounds = defineComponent({
    props: {
        tournamentId: {
            type: Number,
            required: true,
        },
    },
    state: () => ({
        rounds: {},
        loading: true,
        error: null,
        currentUser: null,
    }),
    async onMounted() {
        try {
            const response = await myFetch(
                `${BACKEND_URL}/manage/tour/tournament/${this.props.tournamentId}/matches/`
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch matches: ${response.statusText}`
                );
            }
            const data = await response.json();
            const lastRound = Object.keys(data.rounds).sort().pop();
            const finalMatch = data.rounds[lastRound]?.[0];

            if (finalMatch && finalMatch.winner) {
                this.$emit("tournamentWinner", finalMatch.winner);
            }
            this.$updateState({
                rounds: data.rounds,
                loading: false,
                tournamentWinner: finalMatch?.winner || null,
            });

            // Fetch current user
            const userResponse = await myFetch(
                `${BACKEND_URL}/manage/profile/`
            );
            if (userResponse.ok) {
                const userData = await userResponse.json();
                this.$updateState({ currentUser: userData });
            }

            this.updateRoundsCallBack = (data) => this.updateRounds(data);

            if (tournamentWebSocketManager.socket) {
                tournamentWebSocketManager.socket.send(
                    JSON.stringify({
                        type: "user_join_rounds",
                        tournament_id: this.props.tournamentId,
                    })
                );
                tournamentWebSocketManager.subscribe(
                    "rounds_update",
                    this.updateRoundsCallBack
                );
            }
        } catch (error) {
            console.error("Error fetching tournament matches:", error);
            this.$updateState({ error: error.message, loading: false });
        }
    },

    onUnmounted() {
        if (tournamentWebSocketManager) {
            tournamentWebSocketManager.unsubscribe(
                "rounds_update",
                this.updateRoundsCallBack
            );
        }
    },
    methods: {
        updateRounds(data) {
            // console.log(data);
            this.$updateState({ rounds: data.rounds });
        },
        async handleStartMatch(match) {
            const { currentUser } = this.state;
            if (
                !currentUser ||
                (currentUser.user !== match.player_one.id &&
                    currentUser.user !== match.player_two.id)
            ) {
                alert("Only the players in this match can start it.");
                return;
            }

            try {
                const response = await myFetch(
                    `${BACKEND_URL}/manage/tour/match/${match.id}/start/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    // console.log("Match started successfully:", data);
                    // console.log(data);

                    // Navigate to the game page with match ID
                    this.$context.router.navigateTo(
                        `/tournament/${this.props.tournamentId}/game/${data.match_id}`
                    );
                } else {
                    const error = await response.json();
                    alert(error.error || "Failed to start match.");
                }
            } catch (error) {
                console.error("Error starting match:", error);
                alert("An error occurred while starting the match.");
            }
        },
    },
    render() {
        const { rounds, loading, error } = this.state;

        if (loading) {
            return h("div", { className: "loading" }, "Loading rounds...");
        }
        if (error) {
            return h("div", { className: "error-message" }, `Error: ${error}`);
        }
        if (!Object.keys(rounds).length) {
            return h(
                "div",
                { className: "no-matches-message" },
                "No matches found for this tournament."
            );
        }

        return h(
            "div",
            { className: "tournament-rounds-container p-4" },
            Object.keys(rounds).map((round) =>
                h("div", { className: "round-container mb-4" }, [
                    h("h3", {}, `Round ${round}`),
                    h(
                        "div",
                        { className: "matches-list" },
                        rounds[round].map((match) =>
                            h(
                                "div",
                                {
                                    className:
                                        "match-card p-2 mb-2 border rounded",
                                },
                                [
                                    h(
                                        "p",
                                        {},
                                        `${match.player_one.display_name} vs ${match.player_two.display_name}`
                                    ),
                                    h("p", {}, `Status: ${match.status}`),
                                    match.status !== "Completed"
                                        ? h(
                                            "button",
                                            {
                                                className: "btn-start-match",
                                                "on:click": () =>
                                                    this.handleStartMatch(
                                                        match
                                                    ),
                                                disabled:
                                                    this.state.currentUser &&
                                                    this.state.currentUser
                                                        .user !==
                                                        match.player_one.id &&
                                                    this.state.currentUser
                                                        .user !==
                                                        match.player_two.id,
                                            },
                                            "Start Match"
                                        )
                                        :null ,
                                    match.winner
                                        ? h(
                                              "p",
                                              {},
                                              `Winner: ${
                                                  match.player_one.id ==
                                                  match.winner
                                                  ? match.player_one.display_name
                                                  : match.player_two.display_name
                                              }`
                                          )
                                        : h("p", {}, "Winner: TBD"),
                                ]
                            )
                        )
                    ),
                ])
            )
        );
    },
});
