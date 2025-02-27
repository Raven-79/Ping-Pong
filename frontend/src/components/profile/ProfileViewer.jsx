import { h, defineComponent } from "../../../lib/index.js";
import { BASE_API_URL } from "../../utils/constants.js";
import { Spinner } from "../common/Spiner.js";
import { ProfileHub } from "./ProfileHub.js";
import { UserStatsViewer } from "./UserStatsViewer.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";
import { ServerError } from "../common/ServerError.js";

export const ProfileViewer1 = defineComponent({
  state() {
    return {
      userData: null,
      isLoading: true,
      serverError: false,
    };
  },

  render() {
    if (this.state.isLoading) return <Spinner />;
    if (this.state.serverError) {
      return <ServerError />;
    }
    return (
      <div className="p-3 h-lg-100 d-flex flex-column">
        <UserStatsViewer
          userData={this.state.userData}
          id={this.$context.router.params.id}
          on:statusChange={(status) => {
            // console.log("status", status);
            this.$updateState({ userData: { ...this.state.userData, status } });
          }}
        />
        {this.state.userData.status == "blocked_by" ||
        this.state.userData.status == "blocked" ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <div className="c-blocked-img">
              <img
                src="./img/blocked_by.png"
                className="img c-blocked-img w-100 h-100"
              />
            </div>
            {this.state.userData.status == "blocked" ? (
              <h1>You have blocked this user</h1>
            ) : (
              <h1>You are blocked by this user</h1>
            )}
          </div>
        ) : (
          <ProfileHub userData={this.state.userData} />
        )}
      </div>
    );
  },
  async onMounted() {
    // console.log(this.$context.router.params.id);
    const profile = await myFetch(
      `${BACKEND_URL}/manage/profile/${this.$context.router.params.id}/`
    );
    if (!profile.ok) {
      this.$updateState({ serverError: true , isLoading: false});
      return;
    }
    const userData = await profile.json();
    if(userData.redirect) {
      this.$context.router.navigateTo("/profile");
      return;
    }
    const statistics = await myFetch(
      `${BACKEND_URL}/manage/userStatistics/${this.$context.router.params.id}/`
    );
    if (!statistics.ok) {
      this.$updateState({ serverError: true , isLoading: false});
      return;
    }
    userData.statistics = await statistics.json();
    // console.log("============> userData", userData);
    this.$updateState({
      isLoading: false,
      userData,
    });
  },
});


export const ProfileViewer = defineComponent({


  render() {
     return <ProfileViewer1 key={this.$context.router.params.id}/>;
  },
 
});
