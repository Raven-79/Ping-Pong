import { destroyDOM } from "./destroy-dom.js";
import { mountDOM } from "./mount-dom.js";
import { patchDOM } from "./patch-dom.js";
import {
  DOM_TYPES,
  didCreateSlot,
  extractChildren,
  resetDidCreateSlot,
} from "./h.js";
import { hasOwnProperty } from "./utils/objects.js";
import { Dispatcher } from "./dispatcher.js";
import { fillSlots } from "./slots.js";
import { storeDispatcher } from './store.js';

const emptyFn = () => {};
export function defineComponent({
  render,
  state,
  onMounted = emptyFn,
  onUnmounted = emptyFn,
  methods = {},
  watchers = {},
  propsWatchers = {},
  subscribeStore = [],
}) {
  class Component {
    #isMounted = false;
    #vdom = null;
    #hostEl = null;
    #eventHandlers = null;
    #parentComponent = null;
    #dispatcher = new Dispatcher();
    #subscriptions = [];
    #watchers = watchers ?? {};
    #propsWatchers = propsWatchers ?? {};
    #children = [];
    #appContext = null;
    subscribeStore = subscribeStore;

    setExternalContent(children) {
      this.#children = children;
    }

    constructor(props = {}, eventHandlers = {}, parentComponent = null) {
      this.props = props;
      this.state = state ? state(props) : {};
      this.#eventHandlers = eventHandlers;
      this.#parentComponent = parentComponent;
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).flatMap((child) => {
          if (child.type === DOM_TYPES.COMPONENT) {
            return child.component.elements;
          }
          return [child.el];
        });
      }
      return [this.#vdom.el];
    }

    get firstElement() {
      return this.elements[0];
    }

    get offset() {
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return Array.from(this.#hostEl.children).indexOf(this.firstElement);
      }
      return 0;
    }
    updateProps(props) {
      const oldProps = this.props;
      this.props = { ...this.props, ...props };
      const propsUpdates = Object.keys(props);
      for (const prop of propsUpdates) {
        if (this.props[prop] != oldProps[prop] && prop in this.#propsWatchers) {
          this.#propsWatchers[prop].call(
            this,
            this.props[prop],
            oldProps[prop]
          );
        }
      }

      this.#patch();
    }
    $emit(eventName, payload) {
      this.#dispatcher.dispatch(eventName, payload);
    }

    $updateState(state) {
      const oldState = this.state;
      this.state = { ...this.state, ...state };
      const statesUpdates = Object.keys(state);
      for (const state of statesUpdates) {
        if (this.state[state] != oldState[state] && state in this.#watchers) {
          this.#watchers[state].call(this, this.state[state], oldState[state]);
        }
      }
      this.#patch();
    }
    render() {
      // return render.call(this);
      const vdom = render.call(this);
      // fillSlots(vdom, this.#children);
      if (didCreateSlot()) {
        fillSlots(vdom, this.#children);
        resetDidCreateSlot();
      }
      return vdom;
    }
    mount(hostEl, index = null) {
      if (this.#isMounted) {
        throw new Error("Component is already mounted");
      }
      this.#vdom = this.render();
      if(!this.#vdom){
        console.warn("Rander Function return undefined ")
      }
      mountDOM(this.#vdom, hostEl, index, this);
      this.#wireEventHandlers();
      this.#hostEl = hostEl;
      for (const key of this.subscribeStore) {
        // console.log("key",key)
        const unsubscribe = storeDispatcher.subscribe(key, this.#patch.bind(this));
        this.#subscriptions.push(unsubscribe);
      }
      this.#isMounted = true;
    }
    unmount() {
      if (!this.#isMounted) {
        throw new Error("Component is not mounted");
      }
      destroyDOM(this.#vdom);
      this.#subscriptions.forEach((unsubscribe) => unsubscribe());

      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
      this.#subscriptions = [];
    }
    onMounted() {
      return Promise.resolve(onMounted.call(this));
    }
    onUnmounted() {
      return Promise.resolve(onUnmounted.call(this));
    }
    setAppContext(appContext) {
      this.#appContext = appContext;
    }

    
    get $context() {
      return this.#appContext;
    }
    #patch() {
      if (!this.#isMounted) {
        throw new Error("Component is not mounted");
      }
      const vdom = this.render();
      this.#vdom = patchDOM(this.#vdom, vdom, this.#hostEl, this);
    }
    patch(){
      this.#patch();
    }

    #wireEventHandlers() {
      this.#subscriptions = Object.entries(this.#eventHandlers).map(
        ([eventName, handler]) => this.#wireEventHandler(eventName, handler)
      );
    }

    #wireEventHandler(eventName, handler) {
      return this.#dispatcher.subscribe(eventName, (payload) => {
        if (this.#parentComponent) {
          handler.call(this.#parentComponent, payload);
        } else {
          handler(payload);
        }
      });
    }
  }
  for (const methodName in methods) {
    if (hasOwnProperty(Component, methodName)) {
      throw new Error(
        `Method "${methodName}()" already exists in the component.`
      );
    }
    Component.prototype[methodName] = methods[methodName];
  }
  return Component;
}
