import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { Link } from "../common/Link.js";
import { i18n } from "../../utils/i18n.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";
import { Store } from "../../../lib/store.js";

export const Avatar = defineComponent({
  subscribeStore:["image_changed"],
  render() {
    return (
      <div class="nav-item dropdown position-relative">
        <button
          class="nav-link  custom-navBar-items"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src={Store.image_changed ?? `${BACKEND_URL}/auth${this.props.userImg}`}
            className=" c-img "
          />
        </button>
        <div class="dropdown-menu  p-2 mt-2 c-dropdown-menu  ">
          <div className="">
            <Link className="dropdown-item  c-dropdown-item" to="/profile">
              <i class="fa-solid fa-user pe-2"></i>
              {i18n.t("navBar.viewProfile")}
            </Link>
          </div>
          <div className=" ">
            <Link
              className="dropdown-item text-decoration-none  c-dropdown-item"
              to="/settings"
            >
              <i class="fa-solid fa-gear pe-2"></i>
              {i18n.t("navBar.settings")}
            </Link>
          </div>
          <li>
            <hr className="dropdown-divider bg-light" />
          </li>
          <div>
            <a
              class="dropdown-item  c-dropdown-item"
              href="#"
              on:click={() => this.$emit("logout")}
            >
              <i class="fa-solid fa-right-from-bracket pe-2"></i>
              {i18n.t("navBar.logout")}
            </a>
          </div>
        </div>
      </div>
    );
  },
});
