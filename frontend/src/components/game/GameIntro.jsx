import { h, Fragment, defineComponent } from "../../../lib/index.js";

export const GameIntro = defineComponent({
  render() {
    return (
      <div className="d-flex flex-column h-100 justify-content-center align-items-center w-100">
        <div className="row w-75 h-100 justify-content-center align-items-center">
          <div className="col-12 col-lg-6 ">
            <div className="p-5 d-flex flex-column justify-content-center align-items-center position-relative c-game-intro-card mb-3">
              <i class="fa-regular fa-circle-dot position-absolute top-0 start-0 m-2 "></i>
              <i class="fa-regular fa-circle-dot position-absolute top-0 end-0 m-2 "></i>
              <i class="fa-regular fa-circle-dot position-absolute bottom-0 start-0 m-2 "></i>
              <i class="fa-regular fa-circle-dot position-absolute bottom-0 end-0 m-2 "></i>
              <h2 className="mb-4">Space Pong</h2>
              <div className="h-50 w-50 ">
                <img
                  src="./img/ping-pong-intro.png"
                  alt="pong"
                  className="img-fluid"
                />
              </div>
              <p className="lead text-light mb-4">Get ready</p>
              <div className="d-flex flex-column flex-lg-row justify-content-around align-items-center w-100">
                <button
                  className="btn c-btn-danger mb-2 mb-lg-0"
                  on:click={() => this.$emit("startGame", "pong")}
                >
                  Remote Game
                </button>
                <button
                  className="btn c-btn-danger "
                  on:click={() => this.$emit("localGame")}
                >
                Local Game
                </button>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6  ">
            <div className="p-5 d-flex flex-column justify-content-center align-items-center position-relative c-game-intro-card mb-3">
              <i class="fa-regular fa-circle-dot position-absolute top-0 start-0 m-2"></i>
              <i class="fa-regular fa-circle-dot position-absolute top-0 end-0 m-2 "></i>
              <i class="fa-regular fa-circle-dot position-absolute bottom-0 start-0 m-2 "></i>
              <i class="fa-regular fa-circle-dot position-absolute bottom-0 end-0 m-2 "></i>
              <h2 className="mb-4">Tic Tac Toe</h2>
              <div className="h-50 w-50 ">
                <img
                  src="./img/tic-tac-toe-intro.png"
                  alt="pong"
                  className="img-fluid"
                />
              </div>
              <p className="lead text-light mb-4">Get ready</p>
              <button
                className="btn c-btn-danger"
                on:click={() => this.$emit("startGame", "tic-tac-toe")}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
