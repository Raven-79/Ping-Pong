import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { NoDataMessage } from "../common/NoDataMessage.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
export const GameOver = defineComponent({
    onMounted() {
        const { tournamentId } = this.props;

        if (tournamentId) {
            this.$context.router.navigateTo(`/tournament/${tournamentId}`);
        }
    },
    render() {
        const winner_color = "rgb(65, 191, 179)";
        const loser_color = "rgb(140, 31, 40)";

        return (
            <div className="d-flex flex-column justify-content-center  h-100 w-100 row align-items-center">
                <div className=" flex-grow-1 d-flex  justify-content-center align-items-end mb-3 mb-sm-0">
                    <h1>Game Over</h1>
                </div>
                <div className="  col-12 col-lg-6 flex-grow-1 ">
                    <div className="d-flex  flex-column flex-sm-row justify-content-between align-items-center  h-100">
                        <div>
                            <img
                                src={`${BACKEND_URL}/auth/media${this.props.playersInfo.playerFrontAvatar}`}
                                alt="user"
                                className="c-profile-img mb-2"
                                style={{
                                    border: `2px solid ${
                                        this.props.isWinner
                                            ? winner_color
                                            : loser_color
                                    }`,
                                }}
                            />
                            <p>{this.props.playersInfo.playerFront}</p>
                        </div>
                        <div className="d-flex flex-column justify-content-center flex-grow-1">
                            <p>Score</p>
                            <p>
                                {" "}
                                {this.props.playersInfo.playerFrontScore} -{" "}
                                {this.props.playersInfo.playerBackScore}
                            </p>
                        </div>
                        <div>
                            <div>
                                <img
                                    src={`${BACKEND_URL}/auth/media${this.props.playersInfo.playerBackAvatar}`}
                                    alt="user"
                                    className="c-profile-img mb-2"
                                    style={{
                                        border: `2px solid ${
                                            this.props.isWinner
                                                ? loser_color
                                                : winner_color
                                        }`,
                                    }}
                                />
                                <p>{this.props.playersInfo.playerBack}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" flex-grow-1">
                    {this.props.isWinner ? (
                        <h2 className="" style={{ color: winner_color }}>
                            You won
                        </h2>
                    ) : (
                        <h2 className="" style={{ color: loser_color }}>
                            You lost
                        </h2>
                    )}
                    <button
                        className="btn c-btn mt-3"
                        on:click={() => this.$emit("backToMenu")}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    },
});
