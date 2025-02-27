import { h, defineComponent } from "../../../lib/index.js";
import { TournamentPlayerCard } from "./TournamentPlaterCard.js";

export const TournamentTemplate16 = defineComponent({
  render() {
    return (
      <div className="h-100 d-flex flex-column">
        <h2 className="m-2">Tournament Template 16</h2>
        <div className="d-flex justify-content-end  align-items-center mx-3">
          <button className="btn c-btn-danger m-2">Join Tournament</button>
        </div>
        <div className="d-flex flex-lg-row flex-column justify-content-around  flex-grow-1 m-2 ">
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
            </div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            <TournamentPlayerCard />
            <TournamentPlayerCard />
            <TournamentPlayerCard />
            <TournamentPlayerCard />
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
            <TournamentPlayerCard />
            <TournamentPlayerCard />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className=" d-none d-lg-block h-50 c-2-linker border-start-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center  ">
            <TournamentPlayerCard />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-start  h-100 flex-grow-1 c-linker">
            <div className="d-none d-lg-block h-50 c-2-linker border-start-0 border-end-0 border-top-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-start-0 border-bottom-0 border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center  ">
            <TournamentPlayerCard />
          </div>
          <div className="d-flex flex-row flex-lg-column justify-content-start  h-100 flex-grow-1 c-linker">
            <div className="d-none d-lg-block h-50 c-2-linker border-start-0 border-end-0 border-top-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-start-0 border-bottom-0 border-top-0"></div>
          </div>
          <div className=" d-flex justify-content-center align-items-center">
            <TournamentPlayerCard />
          </div>
          {/* linker 2 */}
          <div className="d-flex flex-row flex-lg-column justify-content-center  h-100 flex-grow-1 c-linker">
            <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
            <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around align-items-center ">
            <TournamentPlayerCard />
            <TournamentPlayerCard />
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
            <TournamentPlayerCard />
            <TournamentPlayerCard />
            <TournamentPlayerCard />
            <TournamentPlayerCard />
          </div>
          <div className="h-100 d-flex flex-row flex-lg-column justify-content-center  flex-grow-1 c-linker">
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
            </div>
            <div className="d-flex flex-row flex-lg-column justify-content-center  h-25 flex-grow-1">
              <div className=" d-none d-lg-block h-50 c-2-linker border-end-0"></div>
              <div className="d-lg-none d-block w-50 c-2-linker border-bottom-0"></div>
            </div>
          </div>
          <div className=" d-flex flex-row flex-lg-column justify-content-around  ">
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
            <div>
              <TournamentPlayerCard />
              <TournamentPlayerCard />
            </div>
          </div>
        </div>
      </div>
    );
  },
});
