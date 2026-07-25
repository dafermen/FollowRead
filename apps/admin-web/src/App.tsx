import { useCallback, useEffect, useState } from "react";

import { AdminExperience } from "./components/AdminExperience.js";
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

  return (
    <AdminExperience
      pathname={pathname}
      onAuthenticationRequired={() => {
        navigate("/login");
      }}
    />
  );
};
