import { h, Fragment, defineComponent, createApp } from "../../../lib/index.js";

export const WelcomeBanner = defineComponent({
  render() {
    return (
      <div class="vh-100 d-flex justify-content-center align-items-center c-welcoming-animation">
        <div className="d-flex flex-column  align-items-center">
          <p class="text-center  m-0 fw-bold c-welcome-text">
            Welcome to Space Pong
          </p>

          <p class="text-center  m-0 text-light centered-text-block">
            Prepare for an interstellar challenge like no other! In this cosmic
            duel, your spaceship is equipped with powerful deflector shields,
            and your mission is simple: control the ball of energy and send it
            hurtling past your opponent's defenses!{" "}
          </p>

          <button className="btn c-btn border" on:click={()=>this.$emit("changeState")}>Start</button>
        </div>
      </div>
    );
  },
});
