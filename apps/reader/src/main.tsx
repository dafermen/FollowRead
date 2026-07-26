import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";
import { initializeMobileRuntime } from "./mobileRuntime.js";
import { registerReaderServiceWorker } from "./pwa.js";
import "./styles.css";

const rootElement = document.querySelector<HTMLDivElement>("#root");

if (rootElement === null) {
  throw new Error("FollowRead Reader requires a #root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void initializeMobileRuntime();

window.addEventListener("load", () => {
  void registerReaderServiceWorker();
});
