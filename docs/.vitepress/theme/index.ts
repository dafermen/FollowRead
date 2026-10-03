import DefaultTheme from "vitepress/theme";
import { h, type VNode } from "vue";

import "./custom.css";
import "./innovalogic.css";
import { useDocumentationImages } from "./image-zoom";

const applicationLink = (): VNode =>
  h(
    "a",
    {
      class: "followread-application-link",
      href: import.meta.env.BASE_URL.replace(/docs\/$/u, ""),
      target: "_self",
      "aria-label": "Back to the FollowRead application",
    },
    "← Back to the application",
  );

export default {
  extends: DefaultTheme,
  setup() {
    useDocumentationImages("en");
  },
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "nav-bar-content-after": applicationLink,
      "nav-screen-content-after": applicationLink,
    }),
};
