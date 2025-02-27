import { h, Fragment, defineComponent, createApp } from "../../../lib/index.js";

export const LoginButton = defineComponent({
  render() {
    return (
      <button
        type="submit"
        disabled={this.props.disabled || this.props.loginInProgress}
        className="btn c-btn w-100"
        on:click={() => this.$emit("click")}
      >
        {this.props.loginInProgress ? (
          <span>
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">{this.props.content}...</span>
            </div>
            {this.props.content}...
          </span>
        ) : (
          <span className="">{this.props.content}</span>
        )}
      </button>
    );
  },
});
