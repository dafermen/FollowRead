import { describe, expect, it } from "vitest";

import { ConfigurationError, parsePublicRuntimeConfiguration } from "./index.js";

describe("public runtime configuration", () => {
  it("accepts a supported environment and absolute HTTP URL", () => {
    expect(
      parsePublicRuntimeConfiguration({
        VITE_API_BASE_URL: "http://localhost:8000/",
        VITE_APP_ENV: "development",
      }),
    ).toEqual({
      apiBaseUrl: "http://localhost:8000",
      environment: "development",
    });
  });

  it("rejects a missing API URL", () => {
    expect(() => parsePublicRuntimeConfiguration({ VITE_APP_ENV: "test" })).toThrow(
      ConfigurationError,
    );
  });

  it("rejects unsupported environments and URL schemes", () => {
    expect(() =>
      parsePublicRuntimeConfiguration({
        VITE_API_BASE_URL: "file:///secret",
        VITE_APP_ENV: "production",
      }),
    ).toThrow("must use HTTP or HTTPS");
    expect(() =>
      parsePublicRuntimeConfiguration({
        VITE_API_BASE_URL: "https://example.test",
        VITE_APP_ENV: "preview",
      }),
    ).toThrow("VITE_APP_ENV");
  });
});
