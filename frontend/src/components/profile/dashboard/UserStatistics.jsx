import { h, defineComponent } from "../../../../lib/index.js";
import { i18n } from "../../../utils/i18n.js";

export const UserStatistics = defineComponent({
  onMounted() {
    // console.log("UserStatistics on mounted");
    // const id = this.$context.router.params.id;
    // console.log({ ha: id });
    // if (id) {
    //     this.$updateState({
    //         tournamentId: id,
    //     });
    // }
  },
  onUnmounted() {
    // console.log("UserStatistics not mounted");
  },
  render() {
    

    return (
      <div className="h-100 w-100 m-2 row mt-3">
        <div className="col-12 col-lg-6  mb-2 mb-lg-0">
          <div className="c-statis-card d-flex justify-content-between align-items-center mb-2  p-3 position-relative h-100">
            <i class="fa-solid fa-circle position-absolute top-0 start-0 m-2 c-i-font-size"></i>
            <i class="fa-solid fa-circle position-absolute top-0 end-0 m-2 c-i-font-size"></i>
            <i class="fa-solid fa-circle position-absolute bottom-0 start-0 m-2 c-i-font-size"></i>
            <i class="fa-solid fa-circle position-absolute bottom-0 end-0 m-2 c-i-font-size"></i>
            {/* <p className="m-0 ps-3">{i18n.t("profile.wins")}</p>
            <p className="m-0 pe-3">{this.props.userData.wins}</p> */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 h-100">
              <p className="m-0 ps-3 mb-2 mb-sm-0">
                {i18n.t("profile.wins")}:{" "}
                <span className="m-0 px-3">
                  {this.props.userData.statistics.pong.wins}
                </span>
              </p>
              <i class="fa-solid fa-table-tennis-paddle-ball fs-5  c-user-stat-name mb-2 mb-sm-0"></i>
              <p className="m-0 ps-3 mb-2 mb-sm-0">
                {i18n.t("profile.loses")}:{" "}
                <span className="m-0 px-3">
                  {this.props.userData.statistics.pong.losses}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6 ">
          <div className="c-statis-card d-flex justify-content-between align-items-center mb-2  p-3 position-relative h-100">
            <i class="fa-solid fa-circle position-absolute top-0 start-0 m-2 c-i-font-size"></i>
            <i class="fa-solid fa-circle position-absolute top-0 end-0 m-2 c-i-font-size"></i>
            <i class="fa-solid fa-circle position-absolute bottom-0 start-0 m-2 c-i-font-size"></i>
            <i class="fa-solid fa-circle position-absolute bottom-0 end-0 m-2 c-i-font-size"></i>
            {/* <p className="m-0 ps-3">{i18n.t("profile.loses")}</p>
            <p className="m-0 pe-3">{this.props.userData.losses}</p> */}
            <div className="d-flex flex-column justify-content-between align-items-center h-100 w-100">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 ">
                <p className="m-0 ps-3 mb-2 mb-sm-0">
                  {i18n.t("profile.wins")}:{" "}
                  <span className="m-0 px-3">
                    {this.props.userData.statistics.tic_tac_toe.wins}
                  </span>
                </p>
                <div className="c-user-stat-name mb-2 mb-sm-0">
                  <i class="fa-solid fa-x"></i>
                  <i class="fa-solid fa-o"></i>
                </div>
                <p className="m-0 ps-3 mb-2 mb-sm-0">
                  {i18n.t("profile.loses")}:{" "}
                  <span className="m-0 px-3">
                    {this.props.userData.statistics.tic_tac_toe.losses}
                  </span>
                </p>
              </div>
              <div className="w-100 ">
                <p className="m-0 ps-3 mb-2 mb-sm-0 mt-2">
                {i18n.t("profile.draws")}:{" "}
                  <span className="m-0 px-3">
                    {this.props.userData.statistics.tic_tac_toe.draws}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
