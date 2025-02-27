import { h, Fragment, defineComponent } from "../../../lib/index.js";
import { formatDate } from "../../utils/dateFormater.js";
export const SentMessage = defineComponent({
  render() {
    return (
      <div className="d-flex justify-content-end align-items-center me-3 my-2 ">
        <div className="d-flex flex-column align-items-end w-75">
          <div className="c-sent-msg p-2 px-3 text-start">{this.props.message.text}</div>
          <div className="c-mesg-time">{formatDate(new Date(this.props.message.time))}</div>
        </div>
      </div>
    );
  },
});
