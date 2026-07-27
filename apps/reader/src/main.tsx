import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";
import { AppErrorBoundary } from "./AppErrorBoundary.js";
import { installFrontendObservability } from "./frontendObservability.js";
import { initializeMobileRuntime } from "./mobileRuntime.js";
import { registerReaderServiceWorker } from "./pwa.js";
import "./styles.css";

const rootElement = document.querySelector<HTMLDivElement>("#root");

if (rootElement === null) {
  throw new Error("FollowRead Reader requires a #root element.");
}

installFrontendObservability();

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);

void initializeMobileRuntime();

window.addEventListener("load", () => {
  void registerReaderServiceWorker();
});
