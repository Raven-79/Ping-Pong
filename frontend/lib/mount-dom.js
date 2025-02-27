import { DOM_TYPES } from "./h.js";
import { setAttributes } from "./attributes.js";
import { addEventListeners } from "./events.js";
import { extractPropsAndEvents } from "./utils/props.js";
import { enqueueJob } from "./scheduler.js";

export function mountDOM(vdom, parentEl, index, hostComponent = null) {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, index);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, index, hostComponent);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl, index, hostComponent);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      createComponentNode(vdom, parentEl, index, hostComponent);
      enqueueJob(() => vdom.component.onMounted());
      break;
    }
    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}

function createTextNode(vdom, parentEl, index) {
  const elem = document.createTextNode(vdom.value);
  vdom.el = elem;
  //parentEl.appendChild(elem);
  insert(elem, parentEl, index);
}

function createFragmentNodes(vdom, parentEl, index, hostComponent) {
  vdom.el = parentEl;
  // vdom.children.forEach((element) => mountDOM(element, parentEl));
  vdom.children.forEach((child, i) =>
    mountDOM(child, parentEl, index ? index + i : null, hostComponent)
  );
}

function createElementNode(vdom, parentEl, index, hostComponent) {
  const tag = document.createElement(vdom.tag);
  vdom.children.forEach((child) => mountDOM(child, tag, null, hostComponent));
  addProps(tag, vdom, hostComponent);
  vdom.el = tag;
  // parentEl.appendChild(tag);
  insert(tag, parentEl, index);
}

function addProps(el, vdom, hostComponent) {
  const { props, events } = extractPropsAndEvents(vdom);
  vdom.listeners = addEventListeners(events, el, hostComponent);
  setAttributes(el, props);
}

function insert(el, parentEl, index) {
  if (index == null) {
    parentEl.append(el);
    return;
  }
  if (index < 0) {
    throw new Error(`Index must be a positive integer, got ${index}`);
  }

  const children = parentEl.childNodes;
  if (index >= children.length) {
    parentEl.append(el);
  } else {
    parentEl.insertBefore(el, children[index]);
  }
}

function createComponentNode(vdom, parentEl, index, hostComponent) {
  // const Component = vdom.tag;
  const { tag: Component, children } = vdom;
  // const props = vdom.props;
  //const component = new Component(props);
  const { props, events } = extractPropsAndEvents(vdom);
  const component = new Component(props, events, hostComponent);
  component.setExternalContent(children);
  component.setAppContext(hostComponent?.$context ?? {});
  component.mount(parentEl, index);
  vdom.component = component;
  vdom.el = component.firstElement;
}
