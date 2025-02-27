import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { NoDataMessage } from "../common/NoDataMessage.js";
export const InviteLobby = defineComponent({
  render() {
    return (
      <div className="d-flex flex-column h-100 ">
        <div className="d-flex d-flex justify-content-center align-items-center c-no-result py-3 h-100">
          <div>
            <img
              src="img/waiting.png"
              alt=""
              className=" c-matching-icon my-4"
            />
            <div className="mb-3">
              <h5>
                Waithing for the other player to accept the invitation...
              </h5>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
