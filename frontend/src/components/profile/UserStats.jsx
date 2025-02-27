import { h, defineComponent } from "../../../lib/index.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
import { getUserbadge } from "../../utils/dateFormater.js";

export const UserStats = defineComponent({
  render() {
    return (
      <div className="row mb-3  d-flex align-items-center">
        <div className="col-12 col-lg-3 d-flex justify-content-center justify-content-lg-end mb-3">
          <div className="c-profile-img ">
            <img
              src={`${BACKEND_URL}/auth${this.props.userData.avatar}`}
              className="img c-profile-img  w-100 h-100"
            />
          </div>
        </div>
        <div className="col-12 col-lg-6  d-flex justify-content-center justify-content-lg-start  align-items-center mb-3">
          <div className="text-lg-start ">
            <p className="mb-1 c-user-stat-name fs-3">
              {this.props.userData.first_name} {this.props.userData.last_name}
            </p>
            <div className="mb-3 d-flex justify-content-center justify-content-lg-start align-items-center">
              <p className="m-0 c-user-stat-d-name pe-2">
                @_
                {this.props.userData.display_name}
              </p>
              {/* <i class="fa-solid fa-circle .fa-beat-fade c-online-dote"></i> */}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3 d-flex justify-content-center  justify-content-lg-start   mb-3 ">
          <div className="d-flex flex-column">
            <div className="c-ranking-img">
              <img src={getUserbadge(this.props.userData.level)}
               className="img c-profile-badge" />
            </div>
          </div>
        </div>
      </div>
    );
  },
 
});
