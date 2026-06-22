import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallEvent(event);
      setIsVisible(true);
    }

    function handleAppInstalled() {
      setInstallEvent(null);
      setIsVisible(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="install-banner">
      <div>
        <p className="install-banner-title">Pasang di HP</p>
        <p className="install-banner-copy">
          Simpan BRILink Flow ke layar utama agar terasa seperti aplikasi.
        </p>
      </div>
      <div className="install-banner-actions">
        <button className="ghost-button" type="button" onClick={() => setIsVisible(false)}>
          Nanti
        </button>
        <button className="primary-button" type="button" onClick={handleInstall}>
          Pasang App
        </button>
      </div>
    </div>
  );
}
