import { modeLabel } from "./readerPresentation.js";
import { useEffect, useState, type ReactNode } from "react";
import {
  getOfflineSummary,
  OFFLINE_STATE_EVENT,
  synchronizePendingProgress,
} from "./offlineService.js";
import { APP_STATE_EVENT, getReaderConnectivity, subscribeConnectivity } from "./mobileRuntime.js";
import { readPreferences } from "./readerStorage.js";
import { isStandaloneReader, type BeforeInstallPromptEvent } from "./pwa.js";

type NavigationKey =
  | "home"
  | "library"
  | "downloads"
  | "favorites"
  | "history"
  | "vocabulary"
  | "settings"
  | "documentation";

const NAVIGATION: ReadonlyArray<{
  key: NavigationKey;
  href: string;
  label: string;
  icon: string;
}> = [
  { key: "home", href: "/", label: "Inicio", icon: "⌂" },
  { key: "library", href: "/library", label: "Biblioteca", icon: "▤" },
  { key: "downloads", href: "/downloads", label: "Descargas", icon: "↓" },
  { key: "favorites", href: "/favorites", label: "Favoritos", icon: "♡" },
  { key: "history", href: "/history", label: "Historial", icon: "↺" },
  { key: "vocabulary", href: "/vocabulary", label: "Vocabulario", icon: "Aa" },
  { key: "settings", href: "/settings", label: "Ajustes", icon: "⚙" },
];

/**
 * Shared application shell for every Reader screen except the distraction-free reading room.
 *
 * Wide screens use a navigation rail and compact screens use bottom navigation. The same links and
 * labels are rendered in both forms so route meaning does not depend on viewport width.
 */
export const ReaderShell = ({
  active,
  children,
}: {
  active: NavigationKey;
  children: ReactNode;
}) => {
  const [online, setOnline] = useState(getReaderConnectivity().connected);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [offlineSummary, setOfflineSummary] = useState({
    packageCount: 0,
    sizeBytes: 0,
    pendingCount: 0,
  });
  const preferences = readPreferences(window.localStorage);

  useEffect(() => {
    document.documentElement.dataset["readerTheme"] = preferences.theme;
    document.documentElement.dataset["readerMode"] = preferences.mode;
    document.documentElement.style.setProperty(
      "--reader-font-scale",
      String(preferences.fontScale),
    );
    document.documentElement.classList.toggle("reader-reduced-motion", preferences.reduceMotion);
  }, [preferences.fontScale, preferences.mode, preferences.reduceMotion, preferences.theme]);

  useEffect(() => {
    const refreshOfflineSummary = () => {
      void getOfflineSummary().then(setOfflineSummary);
    };
    const handleConnectivity = ({ connected }: { connected: boolean }) => {
      setOnline(connected);
      if (connected) {
        void synchronizePendingProgress().finally(refreshOfflineSummary);
      }
    };
    const handleAppState = (event: Event) => {
      const { isActive } = (event as CustomEvent<{ isActive: boolean }>).detail;
      if (isActive && getReaderConnectivity().connected) {
        void synchronizePendingProgress().finally(refreshOfflineSummary);
      }
    };
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
    };
    const unsubscribeConnectivity = subscribeConnectivity(handleConnectivity);
    window.addEventListener(APP_STATE_EVENT, handleAppState);
    window.addEventListener(OFFLINE_STATE_EVENT, refreshOfflineSummary);
    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("appinstalled", handleInstalled);
    refreshOfflineSummary();
    return () => {
      unsubscribeConnectivity();
      window.removeEventListener(APP_STATE_EVENT, handleAppState);
      window.removeEventListener(OFFLINE_STATE_EVENT, refreshOfflineSummary);
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = async () => {
    if (installPrompt === null) {
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const navigation = (
    <nav aria-label="Navegación principal">
      {NAVIGATION.map((item) => (
        <a
          className={active === item.key ? "nav-item nav-item--active" : "nav-item"}
          href={item.href}
          aria-current={active === item.key ? "page" : undefined}
          key={item.key}
        >
          <span aria-hidden="true">{item.icon}</span>
          <strong>{item.label}</strong>
        </a>
      ))}
    </nav>
  );

  return (
    <div className="reader-app">
      <a className="skip-link" href="#reader-main">
        Saltar al contenido
      </a>
      <aside className="reader-rail">
        <a className="reader-brand reader-brand--rail" href="/" aria-label="FollowRead, inicio">
          <span aria-hidden="true">F</span>
          <strong>FollowRead</strong>
        </a>
        {navigation}
        <a className="rail-help" href="/documentation">
          Ayuda y documentación
        </a>
      </aside>

      <div className="reader-stage">
        <header className="app-header">
          <a className="reader-brand reader-brand--compact" href="/">
            <span aria-hidden="true">F</span>
            <strong>FollowRead</strong>
          </a>
          <div className="header-actions">
            <span
              className={online ? "connection-chip" : "connection-chip connection-chip--offline"}
            >
              <span aria-hidden="true">{online ? "●" : "○"}</span>
              {online
                ? offlineSummary.pendingCount > 0
                  ? `${String(offlineSummary.pendingCount)} por sincronizar`
                  : "Sincronizado"
                : offlineSummary.pendingCount > 0
                  ? `Sin conexión · ${String(offlineSummary.pendingCount)} pendiente`
                  : "Sin conexión"}
            </span>
            {installPrompt !== null && !isStandaloneReader() ? (
              <button className="quiet-button" type="button" onClick={() => void install()}>
                Instalar app
              </button>
            ) : null}
            <a className="mode-chip" href="/settings">
              {modeLabel(preferences.mode)}
            </a>
          </div>
        </header>
        <main id="reader-main" className="app-main" tabIndex={-1}>
          {children}
        </main>
        <div className="reader-bottom-nav">{navigation}</div>
      </div>
    </div>
  );
};
