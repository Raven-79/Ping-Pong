import { h, defineComponent } from "../../../lib/index.js";


export const NickName = defineComponent({
  render() {
    return (
      <div className="row mb-3">
        <div class="mb-3 text-start ">
          <label for="exampleInputEmail1" class="form-label ps-3">
            Nick Name
          </label>
          <input
            type="email"
            class="form-control c-floating-input border-0"
            aria-describedby="emailHelp"
          />
        </div>
      </div>
    );
  },
});
