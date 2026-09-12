import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import { adminHref, adminPathname } from "./navigation.js";

import { DocumentationPage } from "./pages/DocumentationPage.js";
import { PasswordResetPage } from "./pages/PasswordResetPage.js";
import { LoginPage } from "./pages/LoginPage.js";

const AdminExperience = lazy(async () => ({
  default: (await import("./components/AdminExperience.js")).AdminExperience,
}));

export const App = () => {
  const [pathname, setPathname] = useState(adminPathname());

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(adminPathname());
    };

    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", adminHref(path));
    setPathname(path);
    window.scrollTo({ top: 0 });
  }, []);

  if (pathname === "/reset-password") return <PasswordResetPage />;

  if (pathname === "/login") {
    return (
      <LoginPage
        onAuthenticated={() => {
          navigate("/");
        }}
      />
    );
  }

  if (pathname === "/documentation") {
    return <DocumentationPage />;
  }

  return (
    <Suspense
      fallback={
        <main className="route-loading">
          <p role="status">Preparando el panel…</p>
        </main>
      }
    >
      <AdminExperience
        pathname={pathname}
        onAuthenticationRequired={() => {
          navigate("/login");
        }}
      />
    </Suspense>
  );
};
