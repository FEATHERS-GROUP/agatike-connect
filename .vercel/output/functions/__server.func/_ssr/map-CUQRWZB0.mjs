import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
const MapClient = reactExports.lazy(() => import("./MapClient-Djyw4fGE.mjs"));
function MapPage() {
  const [isClient, setIsClient] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "h-[100dvh] w-full bg-background flex items-center justify-center",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin",
      }),
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
    fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "h-[100dvh] w-full bg-background flex items-center justify-center",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin",
      }),
    }),
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapClient, {}),
  });
}
export { MapPage as component };
