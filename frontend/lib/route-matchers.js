import { isNotBlankOrEmptyString } from "./utils/strings.js";

const CATCH_ALL_ROUTE = "*";

export function validateRoute(route) {
  if (typeof route.path !== "string") {
    throw new Error("Route path must be a string");
  }

  if (isNotBlankOrEmptyString(route.path) === false) {
    throw new Error("Route path must not be empty");
  }

  if (route.path[0] !== "/" && route.path !== CATCH_ALL_ROUTE) {
    throw new Error(
      'Route path must start with a "/" or be the catch-all route "*"'
    );
  }

  if (route.redirect && route.path === route.redirect) {
    throw new Error("A redirect route can't redirect to itself");
  }
}

export function makeRouteMatcher(route) {
  validateRoute(route);

  return routeHasParams(route)
    ? makeMatcherWithParams(route)
    : makeMatcherWithoutParams(route);
}

function routeHasParams({ path }) {
  return path.includes(":");
}

function makeMatcherWithParams(route) {
  const regex = makeRouteWithParamsRegex(route);
  const isRedirect = typeof route.redirect === "string";

  return {
    route,
    isRedirect,
    checkMatch(path) {
      return regex.test(path);
    },
    extractParams(path) {
      const { groups } = regex.exec(path);
      return groups;
    },
    extractQuery,
  };
}

function makeRouteWithParamsRegex({ path }) {
  const regex = path.replace(
    /:([^/]+)/g,
    (_, paramName) => `(?<${paramName}>[^/]+)`
  );

  return new RegExp(`^${regex}$`);
}

function makeMatcherWithoutParams(route) {
  const regex = makeRouteWithoutParamsRegex(route);
  const isRedirect = typeof route.redirect === "string";

  return {
    route,
    isRedirect,
    checkMatch(path) {
      return regex.test(path);
    },
    extractParams() {
      return {};
    },
    extractQuery,
  };
}

function makeRouteWithoutParamsRegex({ path }) {
  if (path === CATCH_ALL_ROUTE) {
    return new RegExp("^.*$");
  }

  return new RegExp(`^${path}$`);
}

function extractQuery(path) {
  const queryIndex = path.indexOf("?");

  if (queryIndex === -1) {
    return {};
  }

  const search = new URLSearchParams(path.slice(queryIndex + 1));

  return Object.fromEntries(search.entries());
}
