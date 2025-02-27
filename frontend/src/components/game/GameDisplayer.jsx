import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { initPongGame } from "./dependencies/initPongGame3.js";
import { initLocalPongGame } from "./dependencies/initLocalPongGame.js";
import { Matching } from "./Matching.js";
// import { init_socket, Game } from "./tester.js";
import { init_socket, Game } from "./dependencies/pong3d.js";
import { GameOver } from "./GameOver.js";
import { InviteLobby } from "./InviteLobby.js";
import { InvalidInvite } from "./InvalidInvite.js";
// import { initPingPongGame } from "./dependencies/initPingPongGame.js";
export const GameDisplayer = defineComponent({
    state() {
        return {
            loading: true,
            gameOver: false,
            isWinner: false,
            hasInvite: false,
            invalidInvite: false,
            game: null,
            socket: null,
            playersInfo: {
                playerFront: null,
                playerBack: null,
                playerFrontScore: 0,
                playerBackScore: 0,
                playerFrontAvatar: null,
                playerBackAvatar: null,
            },
        };
    },
    render() {
        console.log("Rendering GameDisplayer with state:", this.state);
        if (this.state.loading && this.state.gameOver) {
            console.error(
                "Unexpected state: Loading and gameOver simultaneously."
            );
            return (
                <div className="error-message">
                    Something went wrong. Please try again later.
                </div>
            );
        }
        if (this.state.invalidInvite) {
            return <InvalidInvite />;
        }

        return (
            <div
                className="h-100 d-flex justify-content-center align-items-center"
                id="canvasParent"
            >
                {this.state.hasInvite ? <InviteLobby /> : <></>}
                {this.state.gameOver ? (
                    <GameOver
                        isWinner={this.state.isWinner}
                        on:backToMenu={() => this.$emit("backToMenu")}
                        playersInfo={this.state.playersInfo}
                        tournamentId={this.props.tournamentId}
                    />
                ) : (
                    <></>
                )}
                {this.state.loading ? <Matching /> : <></>}
            </div>
        );
    },
    async onMounted() {
        const socket = await init_socket("wss://localhost:8443/ws/game/pong3d");
        console.log("socket", socket);
        this.$updateState({ socket });

        const { tournamentId, inviteId } = this.props;
        console.log({ hello: tournamentId });
        const matchId = this.$context.router.params.id;
        console.log("invite id from props", this.props.inviteId);
        if (tournamentId) {
            console.log("tournament");
            this.$updateState({ hasInvite: true, loading: false });
            socket.send(
                JSON.stringify({
                    type: "join_tour_game",
                    gameId: inviteId,
                    tournamentId,
                })
            );
        } else if (inviteId) {
            // console.log("invite ++++++++++++++++++++++++++++++++");
            this.$updateState({ hasInvite: true, loading: false });
            console.log("has invite", inviteId);
            socket.send(JSON.stringify({ type: "join_by_invite", inviteId }));
        } else if (matchId) {
            console.log("joining match", matchId);
            socket.send(JSON.stringify({ type: "join_match", matchId }));
        } else {
            console.log("no invite or match");
            socket.send(JSON.stringify({ type: "join_queue", game: "pong" }));
        }
        const canvasParent = document.getElementById("canvasParent");
        this.$updateState({
            game: new Game(canvasParent, socket, this),
        });
        // window.addEventListener("resize", () => {
        //     this.state.game.handleResize();
        // });
    },
    onUnmounted() {
        console.log("unmounting");
        if (this.state.game) {
            this.state.game.destroy();
        }
        if (this.state.socket) {
            this.state.socket.close(); // Close the WebSocket connection
        }
        // Remove any event listeners
        window.removeEventListener("resize", this.handleResize);
        // this.state.socket.close();
        // window.removeEventListener("resize", () => {
        //     this.state.game.handleResize();
        // });
    },
});
