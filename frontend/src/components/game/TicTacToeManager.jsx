export class TicTacToeManager {
  constructor(socket, gameDisplayer) {
    this.socket = socket;
    this.gameDisplayer = gameDisplayer;
    this.player_symbol = "";
    this.registerEvents();
  }
  sendMove(row, col) {
    this.socket.send(JSON.stringify({ type: "move", row: row, col: col }));
  }
  convertBoardto1D(board) {
    const board1D = [];
    for (let row of board) {
      for (let cell of row) {
        board1D.push(cell);
      }
    }
    return board1D;
  }
  getWinnerStroke(board) {
    const getWinnerStroke = {
      0: "win-h-top",
      1: "win-h-middle",
      2: "win-h-bottom",
      3: "win-v-left",
      4: "win-v-middle",
      5: "win-v-right",
      6: "win-d-right",
      7: "win-d-left",
      8: "",
    };

    if (board[0] === board[1] && board[1] === board[2] && board[0] !== "") {
      return getWinnerStroke[0];
    }
    if (board[3] === board[4] && board[4] === board[5] && board[3] !== "") {
      return getWinnerStroke[1];
    }
    if (board[6] === board[7] && board[7] === board[8] && board[6] !== "") {
      return getWinnerStroke[2];
    }
    if (board[0] === board[3] && board[3] === board[6] && board[0] !== "") {
      return getWinnerStroke[3];
    }
    if (board[1] === board[4] && board[4] === board[7] && board[1] !== "") {
      return getWinnerStroke[4];
    }
    if (board[2] === board[5] && board[5] === board[8] && board[2] !== "") {
      return getWinnerStroke[5];
    }
    if (board[0] === board[4] && board[4] === board[8] && board[0] !== "") {
      return getWinnerStroke[6];
    }
    if (board[2] === board[4] && board[4] === board[6] && board[2] !== "") {
      return getWinnerStroke[7];
    }
    return getWinnerStroke[8];
  }
  registerEvents() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "game_start") {
        console.log("game_start", data);
        this.player_symbol = data.player_symbol;
        this.gameDisplayer.$updateState({
          loading: false,
          hasInvite: false,
          player_symbol: this.player_symbol,
          enemy: data.enemy,
        });
      } else if (data.type === "game_state") {
        console.log("gameBoard", data.board);
        const gameBoard = this.convertBoardto1D(data.board);
        this.gameDisplayer.$updateState({
          gameBoard,
          playerTurn: data.current_player,
        });
      } else if (data.type === "game_over") {
        console.log("game over", data);
        if (data.winner === "draw") {
          this.gameDisplayer.$updateState({
            gameOver: true,
            isWinner: "Draw",
          });
        } else {
          this.gameDisplayer.$updateState({
            gameOver: true,
            isWinner:
              data.winner === this.player_symbol ? "You won" : "You lost",
            winner_line: this.getWinnerStroke(
              this.convertBoardto1D(data.board)
            ),
          });
        }
      }
    };
    this.socket.onclose = () => {
      console.log(" Tic tac toe WebSocket disconnected.");
    };
  }
}
