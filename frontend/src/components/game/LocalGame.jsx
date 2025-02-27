import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { localGame } from "./dependencies/pong3dLocal.js";

export const LocalGame = defineComponent({
  state() {
    return {
      loading: true,
      gameOver: false,
      isWinner: false,
      hasInvite: false,
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
    if (this.state.gameOver) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 gap-4">
          <h1 className="c-user-stat-name">
            The winner is{" "}
            {this.state.playersInfo.playerFrontScore >
            this.state.playersInfo.playerBackScore
              ? this.state.playersInfo.playerFront
              : this.state.playersInfo.playerBack}
          </h1>
          <button
            className="btn c-btn"
            on:click={() => this.$emit("backToMenu")}
          >
            Back To menu
          </button>
        </div>
      );
    }
    return (
      <div
        className="h-100 d-flex justify-content-center align-items-center"
        id="canvasParent"
      >
        {/* {this.state.hasInvite ? <InviteLobby /> : <></>}
            {this.state.gameOver && this.state.game.destroy() ? (
              <GameOver isWinner={this.state.isWinner} />
            ) : (
              <></>
            )}
            {this.state.loading ? <Matching /> : <></>} */}
      </div>
    );
  },
  async onMounted() {
    // const socket = await init_socket("wss://localhost:8443/ws/game/pong3d");
    // console.log("socket", socket);
    // this.$updateState({ socket });
    // this.$updateState({ hasInvite: false, loading: false });
    const canvasParent = document.getElementById("canvasParent");
    this.$updateState({ game: new localGame(canvasParent, this) });
  },
  onUnmounted() {
    if (this.state.game) {
      console.log("in distroy")
      this.state.game.destroy();
    }
  },
});
