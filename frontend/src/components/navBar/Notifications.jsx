import { h, Fragment, defineComponent } from "../../../lib/index.js";

export const Notification = defineComponent({
  render() {
    return (
      <div
        className="position-relative"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="fa-solid fa-bell fs-3 c-notif"></i>
        <span className="bg-danger p-1 rounded-circle c-notif-count">9</span>
        <ul class="dropdown-menu   mt-3 p-2 c-dropdown-menu-nofif ">
          <li>
            <a class="dropdown-item  c-dropdown-item" href="#">
              Message 1
            </a>
          </li>
          <li>
            <a class="dropdown-item  c-dropdown-item" href="#">
              Message 1
            </a>
          </li>
          <li>
            <a class="dropdown-item  c-dropdown-item" href="#">
              Message 1
            </a>
          </li>
        </ul>
      </div>
    );
  },
});
