import { destroyDOM } from "./destroy-dom.js";
import { mountDOM } from "./mount-dom.js";
import { extractChildren } from "./h.js";
import { areNodesEqual } from "./nodes-equal.js";
import { DOM_TYPES } from "./h.js";
import {
  removeAttribute,
  setAttribute,
  removeStyle,
  setStyle,
} from "./attributes.js";
import { objectsDiff } from "./utils/objects.js";
import {
  arraysDiff,
  arraysDiffSequence,
  ARRAY_DIFF_OP,
} from "./utils/arrays.js";
import { isNotBlankOrEmptyString } from "./utils/strings.js";
import { addEventListener } from "./events.js";
import { extractPropsAndEvents } from "./utils/props.js";

export function patchDOM(oldVdom, newVdom, parentEl, hostComponent = null) {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = findIndexInParent(parentEl, oldVdom.el);
    destroyDOM(oldVdom);
    mountDOM(newVdom, parentEl, index, hostComponent);
    return newVdom;
  }
  newVdom.el = oldVdom.el;
  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom);
      return newVdom;
    }
    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom, hostComponent);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      patchComponent(oldVdom, newVdom);
      break;
    }
  }
  patchChildren(oldVdom, newVdom, hostComponent);
  return newVdom;
}

function findIndexInParent(parentEl, el) {
  const index = Array.from(parentEl.childNodes).indexOf(el);
  if (index < 0) {
    return null;
  }
  return index;
}

function patchText(oldVdom, newVdom) {
  const el = oldVdom.el;
  if (oldVdom.value !== newVdom.value) {
    el.nodeValue = newVdom.value;
  }
}
/*********************************/
/**   Patching element nodes    **/
/*********************************/

function patchElement(oldVdom, newVdom, hostComponent) {
  const el = oldVdom.el;
  const {
    events: oldEvents,
    props: { class: oldClass, style: oldStyle, ...oldAttrs },
  } = extractPropsAndEvents(oldVdom);
  const {
    events: newEvents,
    props: { class: newClass, style: newStyle, ...newAttrs },
  } = extractPropsAndEvents(newVdom);
  const { listeners: oldListeners } = oldVdom;
  patchAttrs(el, oldAttrs, newAttrs);
  patchClasses(el, oldClass, newClass);
  patchStyles(el, oldStyle, newStyle);
  newVdom.listeners = patchEvents(
    el,
    oldListeners,
    oldEvents,
    newEvents,
    hostComponent
  );
}

/**  PATCHING ATTRIBUTES  **/

function patchAttrs(el, oldAttrs, newAttrs) {
  const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);
  for (const Attr of removed) {
    removeAttribute(el, Attr);
  }

  for (const Attr of added.concat(updated)) {
    setAttribute(el, Attr, newAttrs[Attr]);
  }
}

/**  PATCHING CSS CLASSES  **/

function patchClasses(el, oldClass, newClass) {
  const oldClasses = toClassList(oldClass);
  const newClasses = toClassList(newClass);

  const { added, removed } = arraysDiff(oldClasses, newClasses);
  if (removed.length > 0) {
    el.classList.remove(...removed);
  }

  if (added.length > 0) {
    el.classList.add(...added);
  }
}

function toClassList(classes = "") {
  return Array.isArray(classes)
    ? classes.filter(isNotBlankOrEmptyString)
    : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}

function patchStyles(el, oldStyle = {}, newStyle = {}) {
  const { added, removed, updated } = objectsDiff(oldStyle, newStyle);
  for (const style of removed) {
    removeStyle(el, style);
  }
  for (const style of added.concat(updated)) {
    setStyle(el, style, newStyle[style]);
  }
}

/**  PATCHING EVENT LISTENERS  */

function patchEvents(
  el,
  oldListeners = {},
  oldEvents = {},
  newEvents = {},
  hostComponent
) {
  const { removed, added, updated } = objectsDiff(oldEvents, newEvents);
  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListeners[eventName]);
  }
  const addedListeners = {};
  for (const eventName of added.concat(updated)) {
    const listener = addEventListener(
      eventName,
      newEvents[eventName],
      el,
      hostComponent
    );
    addedListeners[eventName] = listener;
  }
  return addedListeners;
}

function patchChildren(oldVdom, newVdom, hostComponent) {
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);
  const parentEl = oldVdom.el;
  const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);
  let calebrate_index = 0;
  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    const offset = hostComponent?.offset ?? 0;
    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index + offset, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.REMOVE: {
        destroyDOM(item);
        break;
      }
      case ARRAY_DIFF_OP.MOVE: {
        const oldChild = oldChildren[originalIndex];
        const newChild = newChildren[index];
        if (newChild.type === DOM_TYPES.COMPONENT) {
          let elAtTargetIndex =
            parentEl.childNodes[index + offset + calebrate_index];
          const elements = oldChild.component.elements;

          for (const elem of elements) {
            parentEl.insertBefore(elem, elAtTargetIndex);
          }
          calebrate_index += elements.length - 1;
        } else {
          const el = oldChild.el;
          const elAtTargetIndex =
            parentEl.childNodes[index + offset + calebrate_index];
          parentEl.insertBefore(el, elAtTargetIndex);
        }

        patchDOM(oldChild, newChild, parentEl, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.NOOP: {
        patchDOM(oldChildren[originalIndex], newChildren[index], parentEl, hostComponent);
        break;
      }
    }
  }
}

function patchComponent(oldVdom, newVdom) {
  const { component } = oldVdom;
  const { children } = newVdom;
  //const { props } = newVdom;
  const { props } = extractPropsAndEvents(newVdom);
  component.setExternalContent(children);
  component.updateProps(props);
  newVdom.component = component;
  newVdom.el = component.firstElement;
}
