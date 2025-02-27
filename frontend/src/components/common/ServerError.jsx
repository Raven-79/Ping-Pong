import { h, defineComponent } from "../../../lib/index.js";

export const ServerError = defineComponent({
    render() {
      return (
        <div className="d-flex d-flex justify-content-center align-items-center c-no-result py-3 h-100">
          <div>
           
            <img src="./img/server-error.png" alt="" className=" c-server-error-icon my-4" />
            <div className="mb-3">
              <h5>
                Looks like something went wrong. Please try again later.
              </h5>
            </div>
          </div>
        </div>
      );
    },
  });