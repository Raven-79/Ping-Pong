import { h, defineComponent, Slot } from "../../../lib/index.js";

export const Load = defineComponent({
  render() {
    return (
      <button
        className="btn c-btn mx-2 p-2 mb-3"
        on:click={(e) => this.$emit("click", e)} disabled={this.props.loading}
      >
        {this.props.loading ? (
          <span>
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>{" "}
            Loading...
          </span>
        ) : (
          <span className="">
            <i class="fa-solid fa-arrow-down pe-2"></i>Load more
          </span>
        )}
      </button>
    );
  },
});
