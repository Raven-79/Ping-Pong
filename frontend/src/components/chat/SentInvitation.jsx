import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { formatDate } from "../../utils/dateFormater.js";
import { i18n } from "../../utils/i18n.js";

export const SentInvitation = defineComponent({
  render() {
    // console.log("====================>",this.props.message);
    return (
      <div className="d-flex justify-content-end align-items-center me-3 my-2 p-2">
        <div className="d-flex flex-column align-items-end w-75 ">
          {this.props.message.invitation?.is_expired ? (
            <div className="c-sent-msg p-2 px-3 text-start">
              <p className="m-0">
                <i class="fa-solid fa-clock pe-1"></i>{" "}
                {i18n.t("invitation.expired")}
              </p>
            </div>
          ) : (
            <div className="c-sent-msg p-2 px-3 text-start ">
              <div className="d-flex justify-content-center align-items-center gap-2">
                <p className=" m-0">{i18n.t("invitation.play_game")}</p>

                <button
                  className="btn c-btn c-btn-bg "
                  on:click={() => this.$emit("acceptInvitation")}
                >
                  {i18n.t("invitation.play_button")}
                </button>
              </div>
              <div className="c-expire-time-send">
                <p className="m-0">
                  <i class="fa-solid fa-clock pe-1"></i>{" "}
                  {i18n.t("invitation.expire_warning")}
                </p>
              </div>
            </div>
          )}

          <div className="c-mesg-time">
            {formatDate(new Date(this.props.message.time))}
          </div>
        </div>
      </div>
    );
  },
});
