import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell for FollowRead Reader.
 *
 * The Admin application is intentionally outside this configuration. Capacitor always receives
 * the Reader's own `dist` directory, preserving the architectural and security boundary.
 */
const config: CapacitorConfig = {
  appId: "com.followread.reader",
  appName: "FollowRead Reader",
  webDir: "dist",
  backgroundColor: "#f4f1e8",
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: "#174d3b",
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: "#f4f1e8",
      overlaysWebView: false,
      style: "DARK",
    },
  },
};

export default config;
