import DefaultTheme from "vitepress/theme";
import { h, type VNode } from "vue";

import "./custom.css";

const applicationLink = (): VNode =>
  h(
    "a",
    {
      class: "followread-application-link",
      href: "/",
      target: "_self",
      "aria-label": "Back to the FollowRead application",
    },
    "← Back to the application",
  );

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "nav-bar-content-after": applicationLink,
      "nav-screen-content-after": applicationLink,
    }),
};
