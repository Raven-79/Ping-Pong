import { h, defineComponent, Slot } from "../../../lib/index.js";

export const RouterOutlet = defineComponent({
  state() {
    return {
      matchedRoute: null,
      subscription: null,
    };
  },
  onMounted() {
    // console.log('called')
    const subscription = this.$context.router.subscribe(({ to }) => {
      this.handleRouteChange(to);
    });

    this.$updateState({ subscription, matchedRoute: this.$context.router.matchedRoute ?? null });
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
  render(){
    const { matchedRoute } = this.state;
    // console.log(matchedRoute)
    return <div id="router-outlet" className="h-100 overflow-lg-hidden">
        {matchedRoute ? <matchedRoute.component /> : null}
    </div>
  }
});
    