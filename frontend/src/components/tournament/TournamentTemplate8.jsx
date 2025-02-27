import { h, defineComponent } from "../../../lib/index.js";
import { TournamentPlayerCard } from "./TournamentPlaterCard.js";

export const TournamentTemplate8 = defineComponent({
  render() {
    const firstRoundSection1 = [
      {
        id: 1,
        avatar:
          "https://i.pinimg.com/736x/a0/83/0d/a0830dfdf3e69327638408ed5d61d077.jpg",
        display_name: "Blaze",
        isEliminated: true,
        score: 2, // Lost in the first round
      },
      {
        id: 2,
        avatar:
          "https://i.pinimg.com/564x/85/29/a7/8529a7f675f1e4fa9f72c8a3f5452d7c.jpg",
        display_name: "Frost",
        isEliminated: false,
        score: 8, // Won in the first round
      },
      {
        id: 3,
        avatar:
          "https://i.pinimg.com/564x/d3/df/6f/d3df6fdc4313dd9b55a51da2487c7232.jpg",
        display_name: "Storm",
        isEliminated: true,
        score: 4, // Lost in the first round
      },
      {
        id: 4,
        avatar:
          "https://i.pinimg.com/564x/b7/1c/3b/b71c3b6f7ff10b67f3e4ed11d43fb489.jpg",
        display_name: "Shadow",
        isEliminated: false,
        score: 7, // Won in the first round
      },
    ];

    const firstRoundSection2 = [
      {
        id: 5,
        avatar:
          "https://i.pinimg.com/564x/39/dd/9f/39dd9f4a9629f0c04a4a2fa1b97fb269.jpg",
        display_name: "Nova",
        isEliminated: false,
        score: 9, // Won in the first round
      },
      {
        id: 6,
        avatar:
          "https://i.pinimg.com/736x/f3/58/ec/f358ecb4bccb7a8730f8638b4ec29992.jpg",
        display_name: "Zephyr",
        isEliminated: true,
        score: 3, // Lost in the first round
      },
      {
        id: 7,
        avatar:
          "https://i.pinimg.com/564x/f2/53/51/f253510017ce97f6c8a56f20288d0073.jpg",
        display_name: "Echo",
        isEliminated: false,
        score: 8, // Won in the first round
      },
      {
        id: 8,
        avatar:
          "https://i.pinimg.com/736x/f7/0d/da/f70ddade03d15f7419c7de8e6e0fa5ca.jpg",
        display_name: "Vortex",
        isEliminated: true,
        score: 5, // Lost in the first round
      },
    ];

    const secondRoundSection1 = [
      {
        id: 2,
        avatar:
          "https://i.pinimg.com/564x/85/29/a7/8529a7f675f1e4fa9f72c8a3f5452d7c.jpg",
        display_name: "Frost",
        isEliminated: false,
        score: 10, // Won in the second round
      },
      {
        id: 4,
        avatar:
          "https://i.pinimg.com/564x/b7/1c/3b/b71c3b6f7ff10b67f3e4ed11d43fb489.jpg",
        display_name: "Shadow",
        isEliminated: true,
        score: 6, // Lost in the second round
      },
    ];

    const secondRoundSection2 = [
      {
        id: 5,
        avatar:
          "https://i.pinimg.com/564x/39/dd/9f/39dd9f4a9629f0c04a4a2fa1b97fb269.jpg",
        display_name: "Nova",
        isEliminated: true,
        score: 7, // Lost in the second round
      },
      {
        id: 7,
        avatar:
          "https://i.pinimg.com/564x/f2/53/51/f253510017ce97f6c8a56f20288d0073.jpg",
        display_name: "Echo",
        isEliminated: false,
        score: 12, // Won in the second round
      },
    ];

    const finalRound = [
      {
        id: 2,
        avatar:
          "https://i.pinimg.com/564x/85/29/a7/8529a7f675f1e4fa9f72c8a3f5452d7c.jpg",
        display_name: "Frost",
        isEliminated: true,
        score: 15, // Lost in the final round
      },
      {
        id: 7,
        avatar:
          "https://i.pinimg.com/564x/f2/53/51/f253510017ce97f6c8a56f20288d0073.jpg",
        display_name: "Echo",
        isEliminated: false,
        score: 18, // Won in the final round
      },
    ];

    const winner = [
      {
        id: 7,
        avatar:
          "https://i.pinimg.com/564x/f2/53/51/f253510017ce97f6c8a56f20288d0073.jpg",
        display_name: "Echo",
        isEliminated: false,
        score: 18, // The ultimate winner
      },
    ];

    return (
      <div className="h-100 d-flex flex-column">
        <h2 className="m-2">Tournament Template 8</h2>
        <div className="d-flex justify-content-between align-items-center mx-3">
          <div
            className="fs-3 cursor-pointer "
            on:click={() => this.$emit("back")}
          >
            <i className="fas fa-arrow-left me-2"></i>
          </div>
          <button className="btn c-btn-danger m-2">Join Tournament</button>
        </div>
        <div className="d-flex flex-lg-row flex-column justify-content-around  flex-grow-1 m-2 ">
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            {firstRoundSection1.map((player) => (
              <div>
                <TournamentPlayerCard userData={player} />
              </div>
            ))}
            {/* <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div> */}
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-50 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-50 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
            </div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            {secondRoundSection1.map((player) => (
              <div>
                <TournamentPlayerCard userData={player} />
              </div>
            ))}
            {/* <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div> */}
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center  ">
            <TournamentPlayerCard userData={finalRound[0]} />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-start  h-100 flex-grow-1 c-linker">
            <div className="d-none d-lg-block h-50 c-2-linker border-start-0 border-end-0 border-top-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-start-0 border-bottom-0 border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center  ">
            <TournamentPlayerCard userData={winner[0]} winner="true" />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-start  h-100 flex-grow-1 c-linker">
            <div className="d-none d-lg-block h-50 c-2-linker border-start-0 border-end-0 border-top-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-start-0 border-bottom-0 border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center">
            <TournamentPlayerCard userData={finalRound[1]} />
          </div>
          {/* linker 2 */}
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around align-items-center ">
            {secondRoundSection2.map((player) => (
              <div>
                <TournamentPlayerCard userData={player} />
              </div>
            ))}
            {/* <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div> */}
          </div>
          {/* linker 4 , 2 by 2  */}
          <div className="h-100 d-flex flex-row flex-lg-column justify-content-center  flex-grow-1 c-linker">
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-50 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-50 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
            </div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            {firstRoundSection2.map((player) => (
              <div>
                <TournamentPlayerCard userData={player} />
              </div>
            ))}

            {/* <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
            </div> */}
          </div>
        </div>
      </div>
    );
  },
});
