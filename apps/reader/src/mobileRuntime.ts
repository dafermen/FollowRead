import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Network, type ConnectionStatus } from "@capacitor/network";
import type { PluginListenerHandle } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

export const CONNECTIVITY_EVENT = "followread:connectivity";
export const APP_STATE_EVENT = "followread:app-state";

export type ReaderConnectivity = {
  connected: boolean;
  connectionType: ConnectionStatus["connectionType"];
};

let connectivity: ReaderConnectivity = {
  connected: navigator.onLine,
  connectionType: navigator.onLine ? "unknown" : "none",
};
let runtimePromise: Promise<() => Promise<void>> | null = null;

export const getReaderConnectivity = (): ReaderConnectivity => connectivity;

export const isReaderOnline = (): boolean => connectivity.connected;

export const subscribeConnectivity = (
  listener: (status: ReaderConnectivity) => void,
): (() => void) => {
  const handle = (event: Event) => {
    listener((event as CustomEvent<ReaderConnectivity>).detail);
  };
  window.addEventListener(CONNECTIVITY_EVENT, handle);
  listener(connectivity);
  return () => {
    window.removeEventListener(CONNECTIVITY_EVENT, handle);
  };
};

/**
 * Starts the small native adapter shared by the web and Capacitor builds.
 *
 * IndexedDB and localStorage remain the canonical Reader stores because Capacitor preserves the
 * WebView origin between launches. This adapter adds authoritative device connectivity and
 * foreground/background lifecycle signals without leaking native concerns into Reader Engine.
 */
export const initializeMobileRuntime = (): Promise<() => Promise<void>> => {
  runtimePromise ??= startRuntime();
  return runtimePromise;
};

export const resetMobileRuntimeForTests = (): void => {
  runtimePromise = null;
  connectivity = {
    connected: navigator.onLine,
    connectionType: navigator.onLine ? "unknown" : "none",
  };
};

const startRuntime = async (): Promise<() => Promise<void>> => {
  document.documentElement.dataset["readerPlatform"] = Capacitor.getPlatform();
  document.documentElement.classList.toggle("reader-native", Capacitor.isNativePlatform());

  const handles: PluginListenerHandle[] = [];
  try {
    setConnectivity(await Network.getStatus());
    handles.push(
      await Network.addListener("networkStatusChange", (status) => {
        setConnectivity(status);
      }),
    );
  } catch {
    const handleOnline = () => {
      setConnectivity({ connected: true, connectionType: "unknown" });
    };
    const handleOffline = () => {
      setConnectivity({ connected: false, connectionType: "none" });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      return Promise.resolve();
    };
  }

  if (Capacitor.isNativePlatform()) {
    handles.push(
      await App.addListener("appStateChange", ({ isActive }) => {
        window.dispatchEvent(new CustomEvent(APP_STATE_EVENT, { detail: { isActive } }));
      }),
    );
    await SplashScreen.hide().catch(() => {
      // The launch screen may already be hidden by native configuration.
    });
  }

  return async () => {
    await Promise.all(handles.map((handle) => handle.remove()));
  };
};

const setConnectivity = (status: ConnectionStatus): void => {
  connectivity = {
    connected: status.connected,
    connectionType: status.connectionType,
  };
  window.dispatchEvent(new CustomEvent(CONNECTIVITY_EVENT, { detail: connectivity }));
};
