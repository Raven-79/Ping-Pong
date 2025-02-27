import { h, defineComponent } from "../../../lib/index.js";
import { TournamentList } from "./TournamentList.js";
import { CreateTournament } from "./CreateTournament.js";

export const Tournament = defineComponent({
    state() {
        return {
            activeComponent: "TournamentList", // CreateTournament , TournamentList,
        };
    },
    onMounted() {
        // console.log("tournamen on mounted")        
    },
    onUnmounted() {
        // console.log("tournament not mounted")
    },
    render() {
        return (
            <div className="h-100 d-flex flex-column position-relative">
                {this.state.activeComponent === "TournamentList" ? (
                    <TournamentList
                        // tournamentId={this.state.tournamentId}
                        on:create={() => {
                            this.$updateState({
                                activeComponent: "CreateTournament",
                            });
                        }}
                    />
                ) : (
                    <CreateTournament
                        on:cancel={() => {
                            this.$updateState({
                                activeComponent: "TournamentList",
                            });
                        }}
                    />
                )}
            </div>
        );
    },
});
