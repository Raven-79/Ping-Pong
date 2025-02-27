import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { Link } from "../common/Link.js";
import { SearchBar } from "./SearchBar.js";

export const SideBar = defineComponent({
  render() {
    return (
      <div className=" position-relative c-sidbar-container ms-md-2 flex-shrink-0">
        <div className=" position-absolute start-0 col-md-12 c-icons-bar d-flex align-items-center justify-content-center ">
          <ul className="d-flex flex-md-column justify-content-around align-items-center h-100 m-0 p-0 w-100 flex-grow-1">
            <li>
              <Link className="text-decoration-none" to="/">
                <i class="fa-solid fa-trophy"></i>
              </Link>
            </li>
            <li>
              <Link className="text-decoration-none" to="/leaderbord">
                <i class="fa-solid fa-ranking-star"></i>
              </Link>
            </li>
            <li
              className="d-inline d-md-none cursor-pointer"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
            >
              <a className="text-decoration-none ">
                <i class="fa-solid fa-magnifying-glass"></i>
              </a>
            </li>
            <li>
              <Link className="text-decoration-none" to="/game">
                <i class="fa-solid fa-gamepad"></i>
              </Link>
            </li>
            <li>
              <Link className="text-decoration-none" to="/chat">
                <i class="fa-solid fa-comments"></i>
              </Link>
            </li>
          </ul>
        </div>
        {/* search modal  */}
        <div class="modal-wrapper d-md-none">
          <div
            className="modal fade"
            id="exampleModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog  ">
              <div class="modal-content c-search-modal">
                <div class="modal-header border-bottom-0 p-0">
                  <SearchBar className=" w-100 " id="navbar-search-sm" />
                  {/* <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button> */}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
