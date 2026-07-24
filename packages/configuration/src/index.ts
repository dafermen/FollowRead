export type RuntimeEnvironment = "development" | "test" | "production";

export interface PublicRuntimeConfiguration {
  readonly environment: RuntimeEnvironment;
  readonly apiBaseUrl: string;
}

export class ConfigurationError extends Error {
  override readonly name = "ConfigurationError";
}

const runtimeEnvironments = new Set<RuntimeEnvironment>(["development", "test", "production"]);

export const parsePublicRuntimeConfiguration = (
  values: Readonly<Record<string, string | undefined>>,
): PublicRuntimeConfiguration => {
  const environment = values["VITE_APP_ENV"];
  const apiBaseUrl = values["VITE_API_BASE_URL"];

  if (environment === undefined || !runtimeEnvironments.has(environment as RuntimeEnvironment)) {
    throw new ConfigurationError("VITE_APP_ENV must be development, test, or production.");
  }

  if (apiBaseUrl === undefined || apiBaseUrl.length === 0) {
    throw new ConfigurationError("VITE_API_BASE_URL is required.");
  }

  const parsedUrl = new URL(apiBaseUrl);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ConfigurationError("VITE_API_BASE_URL must use HTTP or HTTPS.");
  }

  return {
    apiBaseUrl: parsedUrl.toString().replace(/\/$/, ""),
    environment: environment as RuntimeEnvironment,
  };
};
