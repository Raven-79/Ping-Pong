import { h, defineComponent } from "../../../../lib/index.js";
import { StatsPanel } from "./StatsPanel.js";
import { AboutUser } from "./AboutUser.js";
import { UserStatistics } from "./UserStatistics.js";

export const UserDashboard = defineComponent({
  render() {
    return (
      <div className=" mx-2 mx-lg-3  row ">
        <UserStatistics userData={this.props.userData} />
        {/* <div className="col-12 col-md-6 col-lg-4 ">
          <AboutUser />
        </div> */}
        <div className="col-12  ">
          <StatsPanel userData={this.props.userData}a />
        </div>
      </div>
    );
  },
});
