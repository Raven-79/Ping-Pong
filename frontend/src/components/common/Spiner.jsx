import {
  h,
  Fragment,
  defineComponent,

} from "../../../lib/index.js";

export const Spinner = defineComponent({
  render() {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100 ">
        <div class="spinner-grow" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  },

});
