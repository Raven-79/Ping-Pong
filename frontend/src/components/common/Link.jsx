import { h, defineComponent, Slot } from "../../../lib/index.js";

export const Link = defineComponent({
  state() {
    return {
      matchedRoute: null,
      subscription: null,
    };
  },
  onMounted() {
  
    const subscription = this.$context.router.subscribe(({ to }) => {
      this.handleRouteChange(to);
    });

    this.$updateState({
      subscription,
      matchedRoute: this.$context.router.matchedRoute ?? null,
    });
  },

  onUnmounted() {
    const { subscription } = this.state;
    this.$context.router.unsubscribe(subscription);
  },
  methods: {
    handleRouteChange(matchedRoute) {
      this.$updateState({ matchedRoute });
    },
  },

  render() {
    const { to, ...rest } = this.props;
    return (
      <a
        {...rest}
        class={this.state.matchedRoute?.path === to ? "active" : ""}
        href={`#${to}`}
        on:click={(e) => {
          e.preventDefault();
          if (!rest.disabled) this.$context.router.navigateTo(to);
        }}
      >
        <Slot></Slot>
      </a>
    );
  },
});
