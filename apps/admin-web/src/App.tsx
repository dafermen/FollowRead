import { useCallback, useEffect, useState } from "react";

import { ContentPage } from "./pages/ContentPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { DocumentationPage } from "./pages/DocumentationPage.js";
import { LoginPage } from "./pages/LoginPage.js";

export const App = () => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
    window.scrollTo({ top: 0 });
  }, []);

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

  if (pathname === "/content") {
    return <ContentPage />;
  }

  return <DashboardPage />;
};
