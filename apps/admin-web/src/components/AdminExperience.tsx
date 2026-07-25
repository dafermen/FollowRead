import { useEffect, useState } from "react";

import {
  AuthenticationError,
  getCurrentSession,
  logout,
  type AuthenticatedUser,
} from "../auth/authClient.js";
import { ContentPage } from "../pages/ContentPage.js";
import { DashboardPage } from "../pages/DashboardPage.js";

type AdminExperienceProps = {
  pathname: string;
  onAuthenticationRequired: () => void;
};

type ExperienceState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthenticatedUser }
  | { status: "preview" }
  | { status: "unavailable" };

export const AdminExperience = ({ pathname, onAuthenticationRequired }: AdminExperienceProps) => {
  const [experience, setExperience] = useState<ExperienceState>({ status: "checking" });
  const [logoutError, setLogoutError] = useState(false);

  useEffect(() => {
    let active = true;

    void getCurrentSession()
      .then((session) => {
        if (active) {
          setExperience({ status: "authenticated", user: session.user });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        if (import.meta.env.DEV) {
          setExperience({ status: "preview" });
          return;
        }

        if (error instanceof AuthenticationError && error.status === 401) {
          onAuthenticationRequired();
          return;
        }

        setExperience({ status: "unavailable" });
      });

    return () => {
      active = false;
    };
  }, [onAuthenticationRequired]);

  if (experience.status === "checking") {
    return (
      <main className="session-state" aria-live="polite">
        <span className="session-state__mark" aria-hidden="true">
          F
        </span>
        <p>Preparando tu espacio editorial…</p>
      </main>
    );
  }

  if (experience.status === "unavailable") {
    return (
      <main className="session-state session-state--error">
        <span className="session-state__mark" aria-hidden="true">
          !
        </span>
        <h1>No pudimos abrir el panel</h1>
        <p>El servicio no está disponible. Tus datos no cambiaron.</p>
        <button
          className="button button--primary"
          type="button"
          onClick={() => {
            window.location.reload();
          }}
        >
          Volver a intentar
        </button>
      </main>
    );
  }

  const user = experience.status === "authenticated" ? experience.user : undefined;
  const handleLogout =
    user === undefined
      ? undefined
      : async () => {
          setLogoutError(false);
          try {
            await logout();
            onAuthenticationRequired();
          } catch {
            setLogoutError(true);
          }
        };

  const page =
    pathname === "/content" ? (
      <ContentPage user={user} onLogout={handleLogout} />
    ) : (
      <DashboardPage user={user} onLogout={handleLogout} />
    );

  return (
    <>
      {logoutError ? (
        <div className="floating-alert" role="alert">
          No pudimos cerrar la sesión. Inténtalo de nuevo.
        </div>
      ) : null}
      {page}
    </>
  );
};
