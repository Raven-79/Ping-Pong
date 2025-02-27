import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { Matching } from "./Matching.js";
import { GameDisplayer } from "./GameDisplayer.js";
import { GameIntro } from "./GameIntro.js";
import { TicTacToe } from "./TicTacToe.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";
import { LocalGame } from "./LocalGame.js";

export const Game = defineComponent({
    state() {
        return {
            activeComponent: "gameIntro",
            game: "",
            inviteId: null,
            tournamentId: null,
        };
    },
    render() {

        if (this.state.activeComponent === "gameIntro") {
            return (
                <GameIntro
                    on:startGame={(e) =>
                        this.$updateState({
                            activeComponent: "matching",
                            game: e,
                        })
                    }
                    on:localGame={() =>
                        this.$updateState({
                            activeComponent: "local-pong",
                        })
                    }
                />
            );
        }
        if(this.state.activeComponent === "local-pong"){
            return(
              <LocalGame
              on:backToMenu={()=>
                this.$updateState({
                    activeComponent: "gameIntro",
                })
              }
              />
            )
        }
        if (this.state.activeComponent === "matching") {
            if (this.state.game === "pong") {
                return (
                    <GameDisplayer
                        chosenGame={this.state.game}
                        inviteId={this.state.inviteId}
                        tournamentId={this.state.tournamentId}
                        on:backToMenu={() =>
                            this.$updateState({ activeComponent: "gameIntro" })
                        }
                        on:unauthorized={() => {
                            this.$context.router.navigateTo(`/`);
                        }}
                    />
                );
            }
            if (this.state.game === "tic-tac-toe") {
                return (
                    <TicTacToe
                        chosenGame={this.state.game}
                        inviteId={this.state.inviteId}
                        on:backToMenu={() =>
                            this.$updateState({ activeComponent: "gameIntro" })
                        }
                    />
                );
            }
        }
    },
    async onMounted() {
        const id = this.$context.router.params.id;
        console.log("Id ----- ",id);
        const tournamentId = this.$context.router.params.tournamentId;

        if (tournamentId) {
            try {
                const response = await myFetch(
                    `${BACKEND_URL}/manage/tour/tournament/game/${id}/auth`
                );
                if (!response.ok) {
                    throw new Error(
                        `Error fetching auth: ${response.statusText}`
                    );
                }
                const data = await response.json();
                if (!data.authorized) {
                    this.redirectToHome();
                    return;
                }
            } catch (error) {
                // console.error("j:", error);
                this.redirectToHome();
                return;
            }

            this.$updateState({
                activeComponent: "matching",
                game: "pong",
                inviteId: id,
                tournamentId,
            });
        }
        if(id){
            this.$updateState({
                activeComponent: "matching",
                game: "pong",
                inviteId: id,
            });
        }
        console.log("inviteId", id);
    },
    methods: {
        redirectToHome() {
            this.$context.router.navigateTo("/");
        },
    },
});
