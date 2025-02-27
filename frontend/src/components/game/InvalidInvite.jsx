import { h, Fragment, defineComponent } from "../../../lib/index.js";

export const InvalidInvite = defineComponent({
  render() {
    console.log("Invalid Invite");
    return (
      <div className="d-flex d-flex justify-content-center align-items-center c-no-result py-3 h-100">
        <div>
          <img
            src="./img/floating.png"
            alt=""
            className=" c-server-error-icon my-4"
          />
          <div className="mb-3">
            <h5>Invalid Invite. Please try again later.</h5>
          </div>
        </div>
      </div>
    );
  },
});
