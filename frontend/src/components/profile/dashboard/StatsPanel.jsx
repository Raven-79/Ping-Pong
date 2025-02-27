import { h, defineComponent } from "../../../../lib/index.js";
import { Charts } from "./Charts.js";
import { UserStatistics } from "./UserStatistics.js";
import { RoundedChart } from "./RoundedChart.js";
export const StatsPanel = defineComponent({
  render() {
    // console.log("StatsPanel",this.props.userData);
    return (
      <div className="row my-3">
        <div className=" col-12 col-lg-6">
          <Charts />
        </div>
        <div className=" col-12 col-lg-6 ">
          <RoundedChart userLevel={this.props.userData.level}  userExp={this.props.userData.points} />
        </div>
        {/* <div className=" col-12 col-lg-6">
          <UserStatistics />
        </div> */}
      </div>
    );
  },
});
