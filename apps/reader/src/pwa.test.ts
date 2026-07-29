import { afterEach, describe, expect, it, vi } from "vitest";

import { isStandaloneReader, registerReaderServiceWorker } from "./pwa.js";

describe("Reader PWA helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers the shell service worker", async () => {
    const registration = {};
    const register = vi.fn(() => Promise.resolve(registration));
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register },
    });
    expect(await registerReaderServiceWorker()).toBe(registration);
    expect(register).toHaveBeenCalledWith("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  });

  it("absorbs registration failures", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register: vi.fn(() => Promise.reject(new Error("blocked"))) },
    });
    expect(await registerReaderServiceWorker()).toBeNull();
  });

  it("detects standalone display mode", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
    expect(isStandaloneReader()).toBe(true);
  });
});
