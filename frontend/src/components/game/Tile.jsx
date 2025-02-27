import { h, Fragment, defineComponent } from "../../../lib/index.js";

export const Tile = defineComponent({
  render() {
    return (
      <div
        className={`game-cell w-100 ${this.props.boarders} d-flex justify-content-center align-items-center`}
        on:click={() => this.$emit("tileClick")}
      >
        <h1 className="m-0">{this.props.value}</h1>
      </div>
    );
  },
});
