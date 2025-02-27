import { h, defineComponent, Fragment } from "../../../lib/index.js";
import { SearchInput } from "./SearchInput.js";
import { BASE_API_URL } from "../../utils/constants.js";
import { debounce } from "../../utils/debounse.js";
import { i18n } from "../../utils/i18n.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";

export const SearchCard = defineComponent({
  render() {
    // console.log(this.props.user);
    return (
      <div
        className="d-flex gap-2  cursor-pointer c-search-card p-1 ps-2 m-1"
        on:click={() => {
            // console.log("click");
          this.$context.router.navigateTo(`/profile/${this.props.user.id}`);
        }}
      >
        <div>
          <img
            src={`${BACKEND_URL}/auth${this.props.user.avatar}`}
            alt="profile_pic"
            className="c-img"
          />
        </div>
        <div className="text-start">
            <p className="c-friend-name m-0">
                {this.props.user.first_name} {this.props.user.last_name}
            </p>
          <p className="c-display-name m-0">
            @_{this.props.user.display_name}</p>
        </div>
      </div>
    );
  },
});

export const SearchResult = defineComponent({
  render() {
    
    if (this.props.error)
      return (
        <div className=" position-absolute  w-100  rounded mt-1 p-2 search-result">
          <div className="p-2">
            <i class="fa-solid fa-circle-exclamation pe-2"></i>
            {i18n.t("errors.gettingData")}
          </div>
        </div>
      );
    return (
      <div className=" position-absolute  w-100  rounded mt-1 p-2 search-result">
        {this.props.resultUsrs.length != 0 ? (
          this.props.resultUsrs.map((user) => <SearchCard user={user} key={user.id} />)
        ) : (
          <div className="p-2">
            <i class="fa-solid fa-user-large-slash pe-2"></i>
            {i18n.t("errors.userNotFound")}
          </div>
        )}
      </div>
    );
  },
});
