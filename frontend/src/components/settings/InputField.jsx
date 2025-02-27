import { h, defineComponent, Fragment } from "../../../lib/index.js";

export const InputField = defineComponent({
  state() {
    return {
      emptyInput: false,
    };
  },
  render() {
    return (
      <div className={this.props.className}>
        <label for="exampleInputEmail1" class="form-label ps-3">
          {this.props.label}
        </label>
        <input
          type={this.props.type}
          className={`form-control c-floating-input  ${
            this.state.emptyInput || this.props.error ? "border border-danger error-shake" : "border-0"
          }`}
          aria-describedby="emailHelp"
          value={this.props.value}
          on:input={(e) => {
            this.$emit("inputChange", { value: e.target.value });
            this.$updateState({
              emptyInput: e.target.value.length === 0,
            });
          }}
        />
        {this.props.error ? (
          <div className="ps-3 pt-2 ">
            <p className="text-danger c-input-error m-0">
              <i class="fa-solid fa-circle-exclamation pe-2"></i>
              {this.props.error}
              {/* This faild can't be empty. */}
            </p>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  },
});
