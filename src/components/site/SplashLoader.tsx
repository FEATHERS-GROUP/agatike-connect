import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function SplashLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only show splash screen on mobile, and specifically standalone PWA mode if possible
    // But to make it feel like an app, we can show it for a short duration on all mobile loads
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent,
    );

    if (!isMobileDevice) {
      setIsVisible(false);
      return;
    }

    // Keep it visible for 1.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500); // 500ms fade transition
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between pb-16 pt-32 transition-opacity duration-500 md:hidden ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-700">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm shadow-2xl">
            <img
              src="/icon.svg"
              alt="Agatike"
              className="w-24 h-24 object-contain rounded-2xl brightness-0 invert"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-white/80 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="text-sm font-medium tracking-wide uppercase">Loading App...</span>
      </div>
    </div>
  );
}
