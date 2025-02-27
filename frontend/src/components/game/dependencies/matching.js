import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { NoDataMessage } from "../common/NoDataMessage.js";
export const Matching = defineComponent({
  render() {
    return (
      <div className="d-flex flex-column h-100 ">
        <div className="d-flex d-flex justify-content-center align-items-center c-no-result py-3 h-100">
          <div>
            <img
              src="img/matching.png"
              alt=""
              className=" c-matching-icon my-4"
            />
            <div className="mb-3">
              <h5>Searching the galaxy for your perfect opponent... Hold tight, astronaut!</h5>
            </div>
          </div>
        </div>
      </div>
    );
  },
});