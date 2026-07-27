export type FrontendFailureSource = "react" | "window.error" | "unhandledrejection";

export const reportFrontendFailure = (source: FrontendFailureSource) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event: "frontend.failure",
      application: "admin",
      source,
      path: window.location.pathname,
    }),
  );
};

let installed = false;

export const installFrontendObservability = () => {
  if (installed) {
    return;
  }
  installed = true;
  window.addEventListener("error", () => {
    reportFrontendFailure("window.error");
  });
  window.addEventListener("unhandledrejection", () => {
    reportFrontendFailure("unhandledrejection");
  });
};
