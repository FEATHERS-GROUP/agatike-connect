import { useEffect, useState } from "react";

export function DynamicFontLoader({ components }: { components: any[] }) {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  useEffect(() => {
    if (!components) return;

    const fontsToLoad = new Set<string>();

    const scanForFonts = (obj: any) => {
      if (!obj || typeof obj !== "object") return;

      Object.entries(obj).forEach(([key, value]) => {
        if (
          typeof key === "string" &&
          key.endsWith("_fontFamily") &&
          typeof value === "string" &&
          value !== "inherit" &&
          value !== ""
        ) {
          fontsToLoad.add(value);
        } else if (typeof value === "object") {
          scanForFonts(value);
        }
      });
    };

    components.forEach(scanForFonts);

    const uniqueFonts = Array.from(fontsToLoad);

    const newFonts = uniqueFonts.filter((f) => !loadedFonts.includes(f));
    if (newFonts.length === 0) return;

    setLoadedFonts((prev) => Array.from(new Set([...prev, ...uniqueFonts])));

    const linkId = "dynamic-google-fonts";
    let link = document.getElementById(linkId) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    const families = Array.from(new Set([...loadedFonts, ...uniqueFonts]))
      .map((font) => `family=${font.replace(/ /g, "+")}:wght@400;500;600;700`)
      .join("&");

    if (families) {
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    }
  }, [components]);

  return null;
}
