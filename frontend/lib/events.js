export function addEventListener(eventName, handler, el, hostComponent = null) {
  // el.addEventListener(eventName, handler);
  // return handler;

  function boundHandler() {
    hostComponent
      ? handler.apply(hostComponent, arguments)
      : handler(...arguments);
  }
  el.addEventListener(eventName, boundHandler);
  return boundHandler;
}

export function addEventListeners(listeners = {}, el, hostComponent = null) {
  const addedListeners = {};
  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el, hostComponent);
    addedListeners[eventName] = listener;
  });
  return addedListeners;
}
export function removeEventListener(eventName, handler, el) {
  el.removeEventListener(eventName, handler);
}

export function removeEventListeners(listeners, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    removeEventListener(eventName, handler, el);
  });
}
