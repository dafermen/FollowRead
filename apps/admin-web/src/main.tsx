import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";
import { AppErrorBoundary } from "./AppErrorBoundary.js";
import { installFrontendObservability } from "./frontendObservability.js";
import "./styles.css";

const rootElement = document.querySelector<HTMLDivElement>("#root");

if (rootElement === null) {
  throw new Error("FollowRead Admin requires a #root element.");
}

installFrontendObservability();

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
