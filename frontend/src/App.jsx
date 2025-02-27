import {
  createApp,
  defineComponent,
  h,
  HashRouter,
  Slot,
} from "../lib/index.js";
import { RouterOutlet } from "./components/common/RouterOutlet.js";
import { Layout } from "./components/Layout.js";

import { routes } from "./routes.js";
import { i18n } from "./utils/i18n.js";
import { getLanguage } from "./utils/language.js";

// console.log(i18n.t("searchBar.test1"));
const PingPong = defineComponent({
  subscribeStore: ["language"],
  state() {
    return { lang: "" };
  },
  render() {
    return (
      <Layout>
        <RouterOutlet />
      </Layout>
    );
  },
  onMounted() {},
});

i18n.locale = getLanguage("en");
const router = new HashRouter(routes);
let app = null;

function mountApp() {
  app = createApp(PingPong, null, { router });
  app.mount(document.body);
}

function unmountApp() {
  if (app) {
    app.unmount();
    app = null;
  }
}

export function reMount() {
  unmountApp();
  mountApp();
}

mountApp();
