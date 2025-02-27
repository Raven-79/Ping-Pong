import { h, defineComponent } from "../../../lib/index.js";
import { TournamentPlayerCard } from "./TournamentPlaterCard.js";

export const TournamentTemplate4 = defineComponent({
  props: {
    tournamentWinner: {
      type: Object,
      default: null,
    },
  },
  render() {

    return (
      <div className="h-100 d-flex flex-column">
        <h1 className="m-2 c-user-stat-name ">
          {this.props.tournamentLastDaitails.tournament.name}
        </h1>
        {/* <div className="d-flex justify-content-end  align-items-center mx-3">
        <button className="btn c-btn-danger m-2">Join Tournament</button>
      </div> */}
        <div className="d-flex flex-lg-row flex-column justify-content-around  flex-grow-1 m-2 ">
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            <div>
              <TournamentPlayerCard
                userData={
                  this.props.tournamentLastDaitails.rounds[1][0].player_one
                }
                winner={false}
                isEliminated={
                  this.props.tournamentLastDaitails.rounds[1][0].winner !==
                  this.props.tournamentLastDaitails.rounds[1][0].player_one.id
                }
              />
            </div>
            <div>
              <TournamentPlayerCard
                userData={
                  this.props.tournamentLastDaitails.rounds[1][0].player_two
                }
                winner={false}
                isEliminated={
                  this.props.tournamentLastDaitails.rounds[1][0].winner !==
                  this.props.tournamentLastDaitails.rounds[1][0].player_two.id
                }
              />
            </div>
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center  ">
            <TournamentPlayerCard
              userData={
                this.props.tournamentLastDaitails.rounds[2][0].player_one
              }
              winner={false}
              isEliminated={
                this.props.tournamentLastDaitails.rounds[2][0].winner !==
                this.props.tournamentLastDaitails.rounds[2][0].player_one.id
              }
            />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-start  h-100 flex-grow-1 c-linker">
            <div className="d-none d-lg-block h-50 c-2-linker border-start-0 border-end-0 border-top-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-start-0 border-bottom-0 border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center  ">
            <TournamentPlayerCard
              userData={this.props.tournamentLastDaitails.winner.user}
              winner={true}
              isEliminated={false}
            />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-start  h-100 flex-grow-1 c-linker">
            <div className="d-none d-lg-block h-50 c-2-linker border-start-0 border-end-0 border-top-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-start-0 border-bottom-0 border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center">
            <TournamentPlayerCard
              userData={
                this.props.tournamentLastDaitails.rounds[2][0].player_two
              }
              winner={false}
              isEliminated={
                this.props.tournamentLastDaitails.rounds[2][0].winner !==
                this.props.tournamentLastDaitails.rounds[2][0].player_two.id
              }
            />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around align-items-center ">
            <div>
              <TournamentPlayerCard
                userData={
                  this.props.tournamentLastDaitails.rounds[1][1].player_one
                }
                winner={false}
                isEliminated={
                  this.props.tournamentLastDaitails.rounds[1][1].winner !==
                  this.props.tournamentLastDaitails.rounds[1][1].player_one.id
                }
              />
            </div>
            <div>
              <TournamentPlayerCard
                userData={
                  this.props.tournamentLastDaitails.rounds[1][1].player_two
                }
                winner={false}
                isEliminated={
                  this.props.tournamentLastDaitails.rounds[1][1].winner !==
                  this.props.tournamentLastDaitails.rounds[1][1].player_two.id
                }
              />
            </div>
          </div>
        </div>
        <div className="my-5 d-flex justify-content-center">
          <button
            className="btn c-btn-danger m-2"
            on:click={() =>{ 
              console.log("here")
              this.$emit("back")}}
          >
            Back to home
          </button>
        </div>
      </div>
      // <div className="h-100 d-flex flex-column">
      //   <h2 className="m-2 text-center">Tournament Champion</h2>
      //   <div className="d-flex justify-content-center align-items-center flex-grow-1">
      //     {this.props.tournamentWinner && (
      //       <TournamentPlayerCard
      //         userData={{
      //             ...this.props.tournamentWinner.user,
      //             displayName: this.props.tournamentWinner.user.display_name || this.props.tournamentWinner.user.username,
      //         }}
      //         winner={true}
      //     />
      //     )}
      //   </div>
      // </div>
    );
  },
});
