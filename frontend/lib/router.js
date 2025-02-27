import { Dispatcher } from "./dispatcher.js";
import { makeRouteMatcher } from "./route-matchers.js";
import { assert } from "./utils/assert.js";

const ROUTER_EVENT = "router-event";

export class HashRouter {
  #matchers = [];

  #matchedRoute = null;

  #dispatcher = new Dispatcher();
  #subscriptions = new WeakMap();
  #subscriberFns = new Set();

  get matchedRoute() {
    return this.#matchedRoute;
  }

  #params = {};

  get params() {
    return this.#params;
  }

  #query = {};

  get query() {
    return this.#query;
  }

  #onPopState = () => this.#matchCurrentRoute(true);

  constructor(routes = []) {
    assert(Array.isArray(routes), "Routes must be an array");
    this.#matchers = routes.map(makeRouteMatcher);
  }

  get #currentRouteHash() {
    const hash = document.location.hash;

    if (hash === "") {
      return "/";
    }

    return hash.slice(1);
  }

  #isInitialized = false;

  async init() {
    if (this.#isInitialized) {
      return;
    }

    if (document.location.hash === "") {
      window.history.replaceState({}, "", "#/");
    }
    window.history.scrollRestoration = "manual";

    window.addEventListener("popstate", this.#onPopState);
    await this.#matchCurrentRoute();

    this.#isInitialized = true;
  }

  destroy() {
    if (!this.#isInitialized) {
      return;
    }

    window.removeEventListener("popstate", this.#onPopState);
    Array.from(this.#subscriberFns).forEach(this.unsubscribe, this);
    this.#isInitialized = false;
  }

  async navigateTo(path, isPoped, scipePushState = false) {
    const matcher = this.#matchers.find((matcher) => matcher.checkMatch(path));

    if (matcher == null) {
      console.warn(`[Router] No route matches path "${path}"`);
      console.log(
        "Available routes:",
        this.#matchers.map((m) => m.route.path)
      ); // Add this for debugging

      this.#matchedRoute = null;
      this.#params = {};
      this.#query = {};

      return;
    }

    if (matcher.isRedirect) {
      return this.navigateTo(matcher.route.redirect, isPoped);
    }

    const from = this.#matchedRoute;
    const to = matcher.route;
    const { shouldNavigate, shouldRedirect, redirectPath } =
      await this.#canChangeRoute(from, to);

    if (shouldRedirect) {
      return this.navigateTo(redirectPath, brbr);
    }

    if (shouldNavigate) {
      this.#matchedRoute = matcher.route;
      this.#params = matcher.extractParams(path);
      this.#query = matcher.extractQuery(path);
      // if ( !isPoped) this.#pushState(path);
      if (!isPoped && !scipePushState) this.#pushState(path);

      this.#dispatcher.dispatch(ROUTER_EVENT, { from, to, router: this });
    }
  }

  back() {
    window.history.back();
  }

  forward() {
    window.history.forward();
  }

  subscribe(handler) {
    const unsubscribe = this.#dispatcher.subscribe(ROUTER_EVENT, handler);
    this.#subscriptions.set(handler, unsubscribe);
    this.#subscriberFns.add(handler);
    return handler;
  }

  unsubscribe(handler) {
    const unsubscribe = this.#subscriptions.get(handler);
    if (unsubscribe) {
      unsubscribe();
      this.#subscriptions.delete(handler);
      this.#subscriberFns.delete(handler);
    }
  }

  #pushState(path) {
    window.history.pushState({}, "", `#${path}`);
  }

  #matchCurrentRoute(isPoped) {
    return this.navigateTo(this.#currentRouteHash, isPoped, true);
  }

  async #canChangeRoute(from, to) {
    const guard = to.beforeEnter;

    if (typeof guard !== "function") {
      return {
        shouldRedirect: false,
        shouldNavigate: true,
        redirectPath: null,
      };
    }

    const result = await guard(from?.path, to?.path);
    if (result === false) {
      return {
        shouldRedirect: false,
        shouldNavigate: false,
        redirectPath: null,
      };
    }

    if (typeof result === "string") {
      return {
        shouldRedirect: true,
        shouldNavigate: false,
        redirectPath: result,
      };
    }

    return {
      shouldRedirect: false,
      shouldNavigate: true,
      redirectPath: null,
    };
  }
}

export class NoopRouter {
  init() {}
  destroy() {}
  navigateTo() {}
  back() {}
  forward() {}
  subscribe() {}
  unsubscribe() {}
}
