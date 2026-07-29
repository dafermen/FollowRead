/**
 * Registers only the Reader shell service worker.
 *
 * Content downloads, checksums and version activation intentionally remain outside this worker;
 * they belong to Phase 9. A registration failure never prevents normal online reading.
 */
export const registerReaderServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  } catch {
    return null;
  }
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export const isStandaloneReader = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches;
