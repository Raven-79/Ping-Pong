import { destroyDOM } from "./destroy-dom.js";
import { mountDOM } from "./mount-dom.js";
import { h } from "./h.js";
import { NoopRouter } from "./router.js";

export function createApp(RootComponent, props = {}, options = {}) {
  let parentEl = null;
  let isMounted = false;
  let vdom = null;

  const context = {
    router: options.router || new NoopRouter(),
  };

  function reset() {
    parentEl = null;
    isMounted = false;
    vdom = null;
  }
  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error("The application is already mounted");
      }
      parentEl = _parentEl;
      vdom = h(RootComponent, props);
      context.router.init().then(() => {

      mountDOM(vdom, parentEl, null, { $context: context });
      
      isMounted = true;
      });
    },
    unmount() {
      if (!isMounted) {
        throw new Error("The application is not mounted");
      }
      destroyDOM(vdom);
      context.router.destroy();
      reset();
    },
  };
}
