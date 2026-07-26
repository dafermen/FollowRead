import { beforeEach, describe, expect, it, vi } from "vitest";

const native = vi.hoisted(() => ({
  active: false,
  appListener: null as ((state: { isActive: boolean }) => void) | null,
  appRemove: vi.fn(() => Promise.resolve()),
  networkListener: null as
    ((status: { connected: boolean; connectionType: "wifi" | "none" | "unknown" }) => void) | null,
  networkRemove: vi.fn(() => Promise.resolve()),
  splashHide: vi.fn(() => Promise.resolve()),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: () => (native.active ? "android" : "web"),
    isNativePlatform: () => native.active,
  },
}));

vi.mock("@capacitor/network", () => ({
  Network: {
    getStatus: vi.fn(() =>
      Promise.resolve({ connected: true, connectionType: native.active ? "wifi" : "unknown" }),
    ),
    addListener: vi.fn(
      (
        _event: string,
        listener: (status: {
          connected: boolean;
          connectionType: "wifi" | "none" | "unknown";
        }) => void,
      ) => {
        native.networkListener = listener;
        return Promise.resolve({ remove: native.networkRemove });
      },
    ),
  },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn((_event: string, listener: (state: { isActive: boolean }) => void) => {
      native.appListener = listener;
      return Promise.resolve({ remove: native.appRemove });
    }),
  },
}));

vi.mock("@capacitor/splash-screen", () => ({
  SplashScreen: { hide: native.splashHide },
}));

import {
  APP_STATE_EVENT,
  getReaderConnectivity,
  initializeMobileRuntime,
  resetMobileRuntimeForTests,
  subscribeConnectivity,
} from "./mobileRuntime.js";

describe("mobile runtime", () => {
  beforeEach(() => {
    native.active = false;
    native.appListener = null;
    native.networkListener = null;
    native.appRemove.mockClear();
    native.networkRemove.mockClear();
    native.splashHide.mockClear();
    document.documentElement.classList.remove("reader-native");
    delete document.documentElement.dataset["readerPlatform"];
    resetMobileRuntimeForTests();
  });

  it("publishes device connectivity and removes its native listener", async () => {
    const observed: boolean[] = [];
    const unsubscribe = subscribeConnectivity((status) => {
      observed.push(status.connected);
    });
    const dispose = await initializeMobileRuntime();

    native.networkListener?.({ connected: false, connectionType: "none" });
    expect(getReaderConnectivity()).toEqual({ connected: false, connectionType: "none" });
    expect(observed).toEqual([true, true, false]);

    unsubscribe();
    await dispose();
    expect(native.networkRemove).toHaveBeenCalled();
    expect(document.documentElement.dataset["readerPlatform"]).toBe("web");
  });

  it("bridges native lifecycle and hides the launch screen", async () => {
    native.active = true;
    resetMobileRuntimeForTests();
    const appStates: boolean[] = [];
    window.addEventListener(
      APP_STATE_EVENT,
      ((event: CustomEvent<{ isActive: boolean }>) => {
        appStates.push(event.detail.isActive);
      }) as EventListener,
      { once: true },
    );

    const dispose = await initializeMobileRuntime();
    native.appListener?.({ isActive: false });

    expect(document.documentElement).toHaveClass("reader-native");
    expect(document.documentElement.dataset["readerPlatform"]).toBe("android");
    expect(native.splashHide).toHaveBeenCalledOnce();
    expect(appStates).toEqual([false]);

    await dispose();
    expect(native.appRemove).toHaveBeenCalled();
  });
});
