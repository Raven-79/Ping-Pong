import { h, defineComponent } from "../../../lib/index.js";
import { MatchHistory } from "./history/MatchHistory.js";
import { UserFriends } from "./friends/UserFriends.js";
import { UserDashboard } from "./dashboard/UserDashboard.js";
import { i18n } from "../../utils/i18n.js";

export const ProfileHub = defineComponent({
    render() {
        return (
            <div className=" container flex-grow-1 overflow-hidden ">
                <div class="row h-100">
                    <div class="col-12 h-100 d-flex flex-column">
                        <ul
                            class="nav justify-content-lg-start justify-content-center flex-nowrap overflow-auto c-profile-nav flex-shrink-0"
                            id="myTab"
                            role="tablist"
                        >
                            <li class="nav-item" role="presentation">
                                <button
                                    class="nav-link active"
                                    id="dashboard-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#dashboard"
                                    type="button"
                                    role="tab"
                                    aria-controls="dashboard"
                                    aria-selected="true"
                                >
                                    <div>
                                        <i class="fa-solid fa-gauge  pe-sm-2"></i>
                                        <span className="d-none d-sm-inline">
                                            {i18n.t("profile.dashboard")}
                                        </span>
                                    </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button
                                    class="nav-link "
                                    id="friends-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#friends"
                                    type="button"
                                    role="tab"
                                    aria-controls="friends"
                                    aria-selected="false"
                                >
                                    <div>
                                        <i class="fa-solid fa-user-group pe-sm-2"></i>
                                        <span className="d-none d-sm-inline">
                                            {" "}
                                            {i18n.t("profile.friends")}
                                        </span>
                                    </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button
                                    class="nav-link "
                                    id="history-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#history"
                                    type="button"
                                    role="tab"
                                    aria-controls="history"
                                    aria-selected="false"
                                >
                                    <div>
                                        <i class="fa-solid fa-clock-rotate-left pe-sm-2"></i>
                                        <span className="d-none d-sm-inline">
                                            {i18n.t("profile.history")}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content   c-profile-content overflow-auto  flex-grow-1 hidden-scrollbar">
                            <div
                                class="tab-pane fade  show active h-100"
                                id="dashboard"
                                role="tabpanel"
                                aria-labelledby="dashboard-tab"
                            >
                                <UserDashboard userData={this.props.userData} />
                            </div>
                            <div
                                class="tab-pane fade  h-100   "
                                id="friends"
                                role="tabpanel"
                                aria-labelledby="friends-tab"
                            >
                                <UserFriends />
                            </div>
                            <div
                                class="tab-pane fade  h-100"
                                id="history"
                                role="tabpanel"
                                aria-labelledby="history-tab"
                            >
                                <MatchHistory />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});
