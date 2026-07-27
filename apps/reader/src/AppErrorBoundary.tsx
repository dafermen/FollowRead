import { Component, type ReactNode } from "react";

import { reportFrontendFailure } from "./frontendObservability.js";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  failed: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch() {
    reportFrontendFailure("react");
  }

  override render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <main className="fatal-error" aria-labelledby="fatal-error-title">
        <div className="fatal-error__card" role="alert">
          <p className="fatal-error__eyebrow">FollowRead está a salvo</p>
          <h1 id="fatal-error-title">Algo no salió como esperábamos</h1>
          <p>
            Tus lecturas y preferencias siguen guardadas. Recarga la aplicación para volver a
            intentarlo.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Recargar FollowRead
          </button>
        </div>
      </main>
    );
  }
}
