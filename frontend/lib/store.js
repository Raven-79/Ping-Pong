import { Dispatcher } from "./dispatcher.js";

export const Store = {
  language: true,
  image_changed: null,
  notifications: [],
  userData: null,
  needs_2fa: false,
};

export const storeDispatcher = new Dispatcher();

export function updateStore(newStore) {
  Object.assign(Store, newStore);
  const newStateKeys = Object.keys(newStore);
  for (const key of newStateKeys) {
    storeDispatcher.dispatch(key, Store[key]);
  }
}


export function notify(type, message) {
    updateStore({
      notifications: [
        ...Store.notifications,
        {
          type,
          message,
        },
      ],
    });
  }
  

// export function imageChanged() {
//   storeDispatcher.dispatch("image_changed", !Store.image_changed);
// }

window.Store = Store;
