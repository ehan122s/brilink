import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function initializeNativeApp() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#eff4ff" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (error) {
    console.warn("StatusBar setup skipped", error);
  }

  try {
    await SplashScreen.hide();
  } catch (error) {
    console.warn("SplashScreen hide skipped", error);
  }
}
