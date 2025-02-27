import { removeEventListeners } from "./events.js";
import { DOM_TYPES } from "./h.js";
import { enqueueJob } from "./scheduler.js";

export function destroyDOM(vdom) {
  const { type } = vdom;
  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      vdom.component.unmount();
      enqueueJob(() => vdom.component.onUnmounted());
      break;
    }
    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`);
    }
  }
  delete vdom.el;
}

function removeTextNode(vdom) {
  vdom.el.remove();
}

function removeElementNode(vdom) {
  if (vdom.listeners) {
    removeEventListeners(vdom.listeners, vdom.el);
    delete vdom.listeners;
  }
  vdom.el.remove();
  vdom.children.forEach(destroyDOM);
}

function removeFragmentNodes(vdom) {
  vdom.children.forEach(destroyDOM);
}
