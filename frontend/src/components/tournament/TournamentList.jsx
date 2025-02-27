import { h, defineComponent } from "../../../lib/index.js";
import { TournamentHeader } from "./TournamentHeader.js";
import { TournamentsDisplay } from "./TournamentsDisplay.js";
import { TournamentDetail } from "./TournamentDetail.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { notify } from "../../../lib/store.js";
export const TournamentList = defineComponent({
    state: () => ({
        activeComponent: "TournamentsDisplay",
        TournamentDetailId: null,
        tournaments: [],
    }),
    async onMounted() {
        try {
            // const id = this.$context.router.params.id;
            // if (id) {

            //   this.$updateState({
            //     activeComponent: "TournamentDetail",
            //     TournamentDetailId: id
            //   });
            //   return ;

            // }
            const response = await myFetch(
                `${BACKEND_URL}/manage/tour/tournament/list/`
            );
            // console.log(response);
            if (!response.ok) {
                throw new Error(
                    `Error fetching tournaments: ${response.statusText}`
                );
            }
            const data = await response.json();
            this.$updateState({ tournaments: data });
        } catch (error) {
            console.error("Error fetching tournaments:", error);
        }
    },
    methods: {
        async joinTournament(tournamentId) {
            try {
                const response = await myFetch(
                    `${BACKEND_URL}/manage/tour/tournament/join/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ tournament_id: tournamentId }),
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    // Tournament joined successfully
                    // console.log(
                    //     "Successfully joined tournament:",
                    //     tournamentId
                    // );
                   notify("success", "Successfully joined tournament");

                    const updatedTournaments = this.state.tournaments.map(
                        (tournament) =>
                            tournament.id === tournamentId
                                ? { ...tournament, has_joined: true }
                                : tournament
                    );

                    this.$updateState({
                        tournaments: updatedTournaments,
                    });
                } else {
                    console.error("Error joining tournament:", data.error);
                }
            } catch (error) {
                console.error("Error joining tournament:", error);
            }
        },
        viewTournamentDetail(tournamentId) {
            // console.log(tournamentId);
            const tournament = this.state.tournaments.find(
                (t) => t.id === tournamentId
            );

            if (!tournament) {
                // console.log("tournament not found");
                notify("error", "Tournament not found");
                return;
            } // TO-DO: show error


            if (!tournament.has_joined) {
                notify("error", "You need to join the tournament first");
                return;
            } // TO-DO: show error

            this.$updateState({
                activeComponent: "TournamentDetail",
                TournamentDetailId: tournamentId,
            });
        },
        goBackToTournaments() {
            this.$updateState({
                activeComponent: "TournamentsDisplay",
                TournamentDetailId: null,
            });
        },
    },

    render() {
        const id = this.$context.router.params.id;

        return h(
            "div",
            {
                className: "h-100 d-flex flex-column",
            },

            h(
                "div",
                null,
                this.state.activeComponent === "TournamentsDisplay"
                    ? h(TournamentHeader, {
                          "on:create": () => this.$emit("create"),
                      })
                    : h(
                          "div",
                          {
                              className:
                                  "d-flex justify-content-center align-items-center m-4",
                          },
                          h(
                              "h1",
                              { className: "text-center" },
                              "Tournament Details"
                          )
                      )
            ),
            // Main Content
            h(
                "div",
                {
                    className: "flex-grow-1 overflow-auto hidden-scrollbar",
                },
                this.state.activeComponent === "TournamentsDisplay" &&
                    id == null
                    ? h(TournamentsDisplay, {
                          tournaments: this.state.tournaments.map(
                              (tournament) => ({
                                  id: tournament.id,
                                  name: tournament.name,
                                  available_slots:
                                      tournament.max_players -
                                      tournament.participants_count,
                                  max_slots: tournament.max_players,
                                  owner: {
                                      display_name: tournament.created_by,
                                  },
                              })
                          ),
                          "on:view": (id) => this.viewTournamentDetail(id),
                          "on:join": (id) => this.joinTournament(id),
                      })
                    : h(TournamentDetail, {
                          id: this.state.TournamentDetailId || id,
                          "on:back": () => {
                            //   console.log("Back event received!");
                              this.goBackToTournaments();
                          },
                          "on:return": () => {
                              this.$updateState({
                                    activeComponent: "TournamentsDisplay",
                                    TournamentDetailId: null,
                                });
                          }
                      })
            )
        );
    },
});
