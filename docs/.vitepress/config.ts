import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

import { navigation, sidebar } from "./navigation.js";

export default withMermaid(
  defineConfig({
    lang: "en-US",
    title: "FollowRead Documentation",
    description:
      "Product, architecture, development, quality, and delivery documentation for FollowRead.",
    base: "/docs/",
    cleanUrls: true,
    lastUpdated: true,
    outDir: "../apps/admin-web/dist/docs",
    rewrites: {
      "README.md": "index.md",
    },
    head: [
      ["link", { rel: "icon", type: "image/svg+xml", href: "/docs/followread.svg" }],
      ["meta", { name: "theme-color", content: "#174d3b" }],
    ],
    markdown: {
      lineNumbers: true,
    },
    vite: {
      build: {
        // Local search and Mermaid are intentionally bundled for a fully offline documentation site.
        chunkSizeWarningLimit: 750,
      },
    },
    mermaid: {
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        primaryColor: "#e5f0e9",
        primaryTextColor: "#21352d",
        primaryBorderColor: "#174d3b",
        lineColor: "#2d755a",
        secondaryColor: "#fff5d7",
        tertiaryColor: "#f2f5f0",
      },
    },
    themeConfig: {
      logo: "/followread.svg",
      siteTitle: "FollowRead Docs",
      nav: navigation,
      sidebar,
      outline: {
        label: "On this page",
        level: [2, 3],
      },
      docFooter: {
        prev: "Previous page",
        next: "Next page",
      },
      search: {
        provider: "local",
        options: {
          translations: {
            button: {
              buttonText: "Search",
              buttonAriaLabel: "Search documentation",
            },
            modal: {
              displayDetails: "Display detailed list",
              resetButtonTitle: "Reset search",
              backButtonTitle: "Close search",
              noResultsText: "No results for",
              footer: {
                selectText: "to select",
                selectKeyAriaLabel: "Enter",
                navigateText: "to navigate",
                navigateUpKeyAriaLabel: "Up arrow",
                navigateDownKeyAriaLabel: "Down arrow",
                closeText: "to close",
                closeKeyAriaLabel: "Escape",
              },
            },
          },
        },
      },
      socialLinks: [{ icon: "github", link: "https://github.com/dafermen/FollowRead" }],
      editLink: {
        pattern: "https://github.com/dafermen/FollowRead/edit/main/docs/:path",
        text: "Edit this page on GitHub",
      },
      footer: {
        message: "FollowRead documentation",
        copyright: "Released under the MIT License.",
      },
    },
  }),
);
