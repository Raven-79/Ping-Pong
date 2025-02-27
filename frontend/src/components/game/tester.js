import { get_valid_access_token } from "../../utils/apiRequest.js";

export async function init_socket(url) {
  const socket = new WebSocket(url, [
    `Authorization.${await get_valid_access_token()}`,
  ]);
  await new Promise((resolve) => {
    socket.onopen = () => {
      resolve();
    };
  });
  return socket;
}

export class Game {
  constructor(canvasParent, socket, gamaDisplayer) {
    this.socket = socket;
    this.canvasParent = canvasParent;
    this.registerEvents();
    this.gamaDisplayer = gamaDisplayer;
  }

  inintGame(data) {
    // console.log(data.dimensions);
    this.canvas = document.createElement("canvas");
    this.canvasParent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.aspect_ratio = data.dimensions.width / data.dimensions.height;
    this.server_dimensions = data.dimensions;
    this.scale = 1;
    this.playerSide = data.player_side;
    this.handleResize();
    this.paddle = {
      left: { x: 0, y: this.height / 2 - 25 },
      right: { x: this.width - 10, y: this.height / 2 - 25 },
    };
    this.scores = { player1: 0, player2: 0 };
    this.ball = { x: this.width / 2, y: this.height / 2, radius: 20 };
    window.addEventListener("keydown", (event) => {
      const key = event.key;
      if (key == "ArrowUp")
        this.socket.send(JSON.stringify({ type: "key_down", key: "ArrowUp" }));
      else if (key == "ArrowDown")
        this.socket.send(
          JSON.stringify({ type: "key_down", key: "ArrowDown" })
        );
    });
    window.addEventListener("keyup", (event) => {
      const key = event.key;
      if (key == "ArrowUp")
        this.socket.send(JSON.stringify({ type: "key_up", key: "ArrowUp" }));
      else if (key == "ArrowDown")
        this.socket.send(JSON.stringify({ type: "key_up", key: "ArrowDown" }));
    });
  }
  closeGame(winner) {
    this.canvasParent.removeChild(this.canvas);
    this.gamaDisplayer.$updateState({
      gameOver: true,
      isWinner: winner == this.playerSide,
    });
    window.removeEventListener("keydown", (event) => {
      const key = event.key;
      if (key == "ArrowUp")
        this.socket.send(JSON.stringify({ type: "key_down", key: "ArrowUp" }));
      else if (key == "ArrowDown")
        this.socket.send(
          JSON.stringify({ type: "key_down", key: "ArrowDown" })
        );
    });
  }
  registerEvents() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "game_start") {
        this.gamaDisplayer.$updateState({ loading: false , hasInvite: false });
        this.inintGame(data);
        this.game_loop();
      } else if (data.type === "game_state") {
        this.paddle.left = data.paddle1;
        this.paddle.right = data.paddle2;
        this.ball = data.ball;
        this.scores = data.scores;
      } else if (data.type === "game_over") {
        this.closeGame(data.winner);
      }
    };
  }

  handleResize() {
    if (this.aspect_ratio == null) return;
    const aspect_ratio = this.aspect_ratio;
    const paret_width = this.canvas.parentElement.clientWidth;
    const parent_height = this.canvas.parentElement.clientHeight;
    const parent_aspect_ratio = paret_width / parent_height;
    if (parent_aspect_ratio > aspect_ratio) {
      this.canvas.width = parent_height * aspect_ratio;
      this.canvas.height = parent_height;
    } else {
      this.canvas.width = paret_width;
      this.canvas.height = paret_width / aspect_ratio;
    }
    this.scale = this.canvas.width / this.server_dimensions.width;

    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  game_loop() {
    requestAnimationFrame(() => this.game_loop());
    if (this.aspect_ratio == null) return;
    this.draw();
  }
  draw() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawBorders();
    this.drawCircle(this.ball);
    this.drawPaddle(this.paddle.left);
    this.drawPaddle(this.paddle.right);
    this.drawScore();
  }

  drawCircle(ball) {
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 5 * this.scale;
    this.ctx.beginPath();
    this.ctx.arc(
      ball.x * this.scale,
      ball.y * this.scale,
      ball.radius * this.scale,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();
    this.ctx.fillStyle = "white";
    this.ctx.fill();
  }
  drawPaddle(paddle) {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      paddle.x * this.scale,
      paddle.y * this.scale,
      paddle.width * this.scale,
      paddle.height * this.scale
    );
  }
  drawScore() {
    this.ctx.fillStyle = "white";
    const fontsize = 52 * this.scale;
    this.ctx.font = `${fontsize}px Pixelify Sans`;
    const playerScore = this.scores.player1;
    // console.log(this.ctx.measureText(playerScore).width);
    this.ctx.fillText(
      this.scores.player1,
      this.canvas.width / 2 -
        100 * this.scale -
        this.ctx.measureText(playerScore).width,
      80 * this.scale
    );
    this.ctx.fillText(
      this.scores.player2,
      this.canvas.width / 2 + 100 * this.scale,
      80 * this.scale
    );
  }
  drawBorders() {
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 15 * this.scale;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.ctx.setLineDash([15 * this.scale, 15 * this.scale]);
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
}
