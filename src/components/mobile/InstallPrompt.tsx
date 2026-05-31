import { useState, useEffect } from "react";
import { X, Share, SquareArrowUp } from "lucide-react";

export function InstallPrompt() {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed recently (e.g. within 7 days)
    const dismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissed) {
      const dismissTime = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissTime < sevenDays) {
        return; // Still dismissed
      }
    }

    // Detect standalone (already installed)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect user agent for mobile
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    setIsMobile(isMobileDevice);
    setIsIOS(isIOSDevice);

    if (isMobileDevice) {
      // Delay showing prompt slightly
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Capture the beforeinstallprompt event for Android
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show prompt if we hid it
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS doesn't have a programmatic install, so the UI just instructs them.
      // We can just keep the prompt visible or change the state to show detailed instructions.
      alert("Tap the Share icon at the bottom, then scroll down and tap 'Add to Home Screen'.");
    } else if (deferredPrompt) {
      // Android/Chrome
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setIsVisible(false);
      } else {
        console.log("User dismissed the install prompt");
      }
      // We can only use the prompt once, so reset it
      setDeferredPrompt(null);
    } else {
      // Android but prompt not available (maybe not supported or already installed)
      alert("You can install this app from your browser's menu by selecting 'Install app'.");
    }
  };

  if (!isVisible || isStandalone || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:hidden">
      <div className="bg-card text-card-foreground shadow-2xl border border-border/60 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
          <img src="/icon.svg" alt="Agatike Logo" className="w-8 h-8 object-contain rounded" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Install Agatike</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {isIOS 
              ? "Install the app for a better experience. Tap the Share button below." 
              : "Install the app on your home screen for quick and easy access."}
          </p>
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isIOS ? (
                <>
                  <SquareArrowUp className="w-3.5 h-3.5" />
                  How to install
                </>
              ) : (
                "Install App"
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="bg-secondary text-secondary-foreground text-xs font-medium px-4 py-2 rounded-full"
            >
              Not now
            </button>
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
