import { Fragment } from "./fragment.js";
import { Slot } from "./slots.js";
import { withoutNulls } from "./utils/arrays.js";
import { isStrigable } from "./utils/strings.js";

let hSlotCalled = false;

export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
  SLOT: "slot",
};

export function h(tag, props, ...children) {
  props ??= {};
  const type =
    typeof tag === "string" ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  if (tag === Fragment) return hFragment(children.flat());
  if (tag === Slot) return hSlot(children.flat());
  return {
    // type: DOM_TYPES.ELEMENT,
    tag,
    props,
    type,
    children: mapTextNodes(withoutNulls(children.flat())),
  };
}

/**
 *
 * @param {any[]} vNodes
 */
export function hFragment(vNodes) {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
}
/**
 *
 * @param {string} str
 */
export function hString(str) {
  return { type: DOM_TYPES.TEXT, value: String(str) };
}

export function didCreateSlot() {
  return hSlotCalled;
}

export function resetDidCreateSlot() {
  hSlotCalled = false;
}

export function hSlot(children = []) {
  hSlotCalled = true;
  return { type: DOM_TYPES.SLOT, children };
}

/**
 *
 * @param {any[]} arr
 * @returns any[]
 */
function mapTextNodes(arr) {
  return arr.map((elem) => {
    return isStrigable(elem) ? hString(elem) : elem;
  });
}

export function extractChildren(vdom) {
  if (vdom.children == null) {
    return [];
  }
  const children = [];
  for (const child of vdom.children) {
    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child, children));
    } else {
      children.push(child);
    }
  }
  return children;
}
