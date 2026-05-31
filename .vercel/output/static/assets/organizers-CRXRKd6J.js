import {
  l as Xt,
  w as s,
  q as c,
  R as Kt,
  v as dr,
  b as fr,
  j as Q,
  a as w,
  C as mr,
  u as pr,
} from "./index-BbCjida8.js";
import { N as vr } from "./Navbar-8zxmLK7V.js";
import { F as hr } from "./Footer-CxcHC3QW.js";
import { c as qt, u as ue, B as Ae } from "./button-BtHMdeJ3.js";
import { S as gr, I as wr } from "./input-Bn2qJlr0.js";
import { X as yr } from "./x-B77yeb99.js";
import { C as br } from "./circle-check-DTgEIP1Q.js";
import "./plus-DEJHAl15.js";
const Er = [
    ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "2e1cvw" }],
    ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" }],
    ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }],
  ],
  xr = Xt("instagram", Er);
const Sr = [
    [
      "path",
      {
        d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
        key: "pff0z6",
      },
    ],
  ],
  Cr = Xt("twitter", Sr),
  Ge = 768;
function Rr() {
  const [e, t] = s.useState(void 0);
  return (
    s.useEffect(() => {
      const n = window.matchMedia(`(max-width: ${Ge - 1}px)`),
        r = () => {
          t(window.innerWidth < Ge);
        };
      return (
        n.addEventListener("change", r),
        t(window.innerWidth < Ge),
        () => n.removeEventListener("change", r)
      );
    }, []),
    !!e
  );
}
function ie(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function (o) {
    if ((e?.(o), n === !1 || !o.defaultPrevented)) return t?.(o);
  };
}
function Dr(e, t) {
  const n = s.createContext(t),
    r = (a) => {
      const { children: l, ...i } = a,
        p = s.useMemo(() => i, Object.values(i));
      return c.jsx(n.Provider, { value: p, children: l });
    };
  r.displayName = e + "Provider";
  function o(a) {
    const l = s.useContext(n);
    if (l) return l;
    if (t !== void 0) return t;
    throw new Error(`\`${a}\` must be used within \`${e}\``);
  }
  return [r, o];
}
function Nr(e, t = []) {
  let n = [];
  function r(a, l) {
    const i = s.createContext(l),
      p = n.length;
    n = [...n, l];
    const u = (d) => {
      const { scope: v, children: E, ...T } = d,
        m = v?.[e]?.[p] || i,
        b = s.useMemo(() => T, Object.values(T));
      return c.jsx(m.Provider, { value: b, children: E });
    };
    u.displayName = a + "Provider";
    function f(d, v) {
      const E = v?.[e]?.[p] || i,
        T = s.useContext(E);
      if (T) return T;
      if (l !== void 0) return l;
      throw new Error(`\`${d}\` must be used within \`${a}\``);
    }
    return [u, f];
  }
  const o = () => {
    const a = n.map((l) => s.createContext(l));
    return function (i) {
      const p = i?.[e] || a;
      return s.useMemo(() => ({ [`__scope${e}`]: { ...i, [e]: p } }), [i, p]);
    };
  };
  return ((o.scopeName = e), [r, Tr(o, ...t)]);
}
function Tr(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const r = e.map((o) => ({ useScope: o(), scopeName: o.scopeName }));
    return function (a) {
      const l = r.reduce((i, { useScope: p, scopeName: u }) => {
        const d = p(a)[`__scope${u}`];
        return { ...i, ...d };
      }, {});
      return s.useMemo(() => ({ [`__scope${t.scopeName}`]: l }), [l]);
    };
  };
  return ((n.scopeName = t.scopeName), n);
}
var Re = globalThis?.document ? s.useLayoutEffect : () => {},
  Or = Kt[" useId ".trim().toString()] || (() => {}),
  Pr = 0;
function Ze(e) {
  const [t, n] = s.useState(Or());
  return (
    Re(() => {
      n((r) => r ?? String(Pr++));
    }, [e]),
    e || (t ? `radix-${t}` : "")
  );
}
var Ar = Kt[" useInsertionEffect ".trim().toString()] || Re;
function Mr({ prop: e, defaultProp: t, onChange: n = () => {}, caller: r }) {
  const [o, a, l] = Ir({ defaultProp: t, onChange: n }),
    i = e !== void 0,
    p = i ? e : o;
  {
    const f = s.useRef(e !== void 0);
    s.useEffect(() => {
      const d = f.current;
      (d !== i &&
        console.warn(
          `${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${i ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
        ),
        (f.current = i));
    }, [i, r]);
  }
  const u = s.useCallback(
    (f) => {
      if (i) {
        const d = jr(f) ? f(e) : f;
        d !== e && l.current?.(d);
      } else a(f);
    },
    [i, e, a, l],
  );
  return [p, u];
}
function Ir({ defaultProp: e, onChange: t }) {
  const [n, r] = s.useState(e),
    o = s.useRef(n),
    a = s.useRef(t);
  return (
    Ar(() => {
      a.current = t;
    }, [t]),
    s.useEffect(() => {
      o.current !== n && (a.current?.(n), (o.current = n));
    }, [n, o]),
    [n, r, a]
  );
}
function jr(e) {
  return typeof e == "function";
}
function _r(e) {
  const t = kr(e),
    n = s.forwardRef((r, o) => {
      const { children: a, ...l } = r,
        i = s.Children.toArray(a),
        p = i.find($r);
      if (p) {
        const u = p.props.children,
          f = i.map((d) =>
            d === p
              ? s.Children.count(u) > 1
                ? s.Children.only(null)
                : s.isValidElement(u)
                  ? u.props.children
                  : null
              : d,
          );
        return c.jsx(t, {
          ...l,
          ref: o,
          children: s.isValidElement(u) ? s.cloneElement(u, void 0, f) : null,
        });
      }
      return c.jsx(t, { ...l, ref: o, children: a });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
function kr(e) {
  const t = s.forwardRef((n, r) => {
    const { children: o, ...a } = n;
    if (s.isValidElement(o)) {
      const l = Wr(o),
        i = Fr(a, o.props);
      return (o.type !== s.Fragment && (i.ref = r ? qt(r, l) : l), s.cloneElement(o, i));
    }
    return s.Children.count(o) > 1 ? s.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var Lr = Symbol("radix.slottable");
function $r(e) {
  return (
    s.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === Lr
  );
}
function Fr(e, t) {
  const n = { ...t };
  for (const r in t) {
    const o = e[r],
      a = t[r];
    /^on[A-Z]/.test(r)
      ? o && a
        ? (n[r] = (...i) => {
            const p = a(...i);
            return (o(...i), p);
          })
        : o && (n[r] = o)
      : r === "style"
        ? (n[r] = { ...o, ...a })
        : r === "className" && (n[r] = [o, a].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function Wr(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var Br = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  ee = Br.reduce((e, t) => {
    const n = _r(`Primitive.${t}`),
      r = s.forwardRef((o, a) => {
        const { asChild: l, ...i } = o,
          p = l ? n : t;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          c.jsx(p, { ...i, ref: a })
        );
      });
    return ((r.displayName = `Primitive.${t}`), { ...e, [t]: r });
  }, {});
function Ur(e, t) {
  e && dr.flushSync(() => e.dispatchEvent(t));
}
function De(e) {
  const t = s.useRef(e);
  return (
    s.useEffect(() => {
      t.current = e;
    }),
    s.useMemo(
      () =>
        (...n) =>
          t.current?.(...n),
      [],
    )
  );
}
function Hr(e, t = globalThis?.document) {
  const n = De(e);
  s.useEffect(() => {
    const r = (o) => {
      o.key === "Escape" && n(o);
    };
    return (
      t.addEventListener("keydown", r, { capture: !0 }),
      () => t.removeEventListener("keydown", r, { capture: !0 })
    );
  }, [n, t]);
}
var zr = "DismissableLayer",
  ct = "dismissableLayer.update",
  Vr = "dismissableLayer.pointerDownOutside",
  Yr = "dismissableLayer.focusOutside",
  At,
  Gt = s.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  Zt = s.forwardRef((e, t) => {
    const {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: r,
        onPointerDownOutside: o,
        onFocusOutside: a,
        onInteractOutside: l,
        onDismiss: i,
        ...p
      } = e,
      u = s.useContext(Gt),
      [f, d] = s.useState(null),
      v = f?.ownerDocument ?? globalThis?.document,
      [, E] = s.useState({}),
      T = ue(t, (h) => d(h)),
      m = Array.from(u.layers),
      [b] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1),
      g = m.indexOf(b),
      C = f ? m.indexOf(f) : -1,
      R = u.layersWithOutsidePointerEventsDisabled.size > 0,
      y = C >= g,
      A = qr((h) => {
        const O = h.target,
          N = [...u.branches].some((_) => _.contains(O));
        !y || N || (o?.(h), l?.(h), h.defaultPrevented || i?.());
      }, v),
      F = Gr((h) => {
        const O = h.target;
        [...u.branches].some((_) => _.contains(O)) || (a?.(h), l?.(h), h.defaultPrevented || i?.());
      }, v);
    return (
      Hr((h) => {
        C === u.layers.size - 1 && (r?.(h), !h.defaultPrevented && i && (h.preventDefault(), i()));
      }, v),
      s.useEffect(() => {
        if (f)
          return (
            n &&
              (u.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((At = v.body.style.pointerEvents), (v.body.style.pointerEvents = "none")),
              u.layersWithOutsidePointerEventsDisabled.add(f)),
            u.layers.add(f),
            Mt(),
            () => {
              n &&
                u.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (v.body.style.pointerEvents = At);
            }
          );
      }, [f, v, n, u]),
      s.useEffect(
        () => () => {
          f && (u.layers.delete(f), u.layersWithOutsidePointerEventsDisabled.delete(f), Mt());
        },
        [f, u],
      ),
      s.useEffect(() => {
        const h = () => E({});
        return (document.addEventListener(ct, h), () => document.removeEventListener(ct, h));
      }, []),
      c.jsx(ee.div, {
        ...p,
        ref: T,
        style: { pointerEvents: R ? (y ? "auto" : "none") : void 0, ...e.style },
        onFocusCapture: ie(e.onFocusCapture, F.onFocusCapture),
        onBlurCapture: ie(e.onBlurCapture, F.onBlurCapture),
        onPointerDownCapture: ie(e.onPointerDownCapture, A.onPointerDownCapture),
      })
    );
  });
Zt.displayName = zr;
var Xr = "DismissableLayerBranch",
  Kr = s.forwardRef((e, t) => {
    const n = s.useContext(Gt),
      r = s.useRef(null),
      o = ue(t, r);
    return (
      s.useEffect(() => {
        const a = r.current;
        if (a)
          return (
            n.branches.add(a),
            () => {
              n.branches.delete(a);
            }
          );
      }, [n.branches]),
      c.jsx(ee.div, { ...e, ref: o })
    );
  });
Kr.displayName = Xr;
function qr(e, t = globalThis?.document) {
  const n = De(e),
    r = s.useRef(!1),
    o = s.useRef(() => {});
  return (
    s.useEffect(() => {
      const a = (i) => {
          if (i.target && !r.current) {
            let p = function () {
              Qt(Vr, n, u, { discrete: !0 });
            };
            const u = { originalEvent: i };
            i.pointerType === "touch"
              ? (t.removeEventListener("click", o.current),
                (o.current = p),
                t.addEventListener("click", o.current, { once: !0 }))
              : p();
          } else t.removeEventListener("click", o.current);
          r.current = !1;
        },
        l = window.setTimeout(() => {
          t.addEventListener("pointerdown", a);
        }, 0);
      return () => {
        (window.clearTimeout(l),
          t.removeEventListener("pointerdown", a),
          t.removeEventListener("click", o.current));
      };
    }, [t, n]),
    { onPointerDownCapture: () => (r.current = !0) }
  );
}
function Gr(e, t = globalThis?.document) {
  const n = De(e),
    r = s.useRef(!1);
  return (
    s.useEffect(() => {
      const o = (a) => {
        a.target && !r.current && Qt(Yr, n, { originalEvent: a }, { discrete: !1 });
      };
      return (t.addEventListener("focusin", o), () => t.removeEventListener("focusin", o));
    }, [t, n]),
    { onFocusCapture: () => (r.current = !0), onBlurCapture: () => (r.current = !1) }
  );
}
function Mt() {
  const e = new CustomEvent(ct);
  document.dispatchEvent(e);
}
function Qt(e, t, n, { discrete: r }) {
  const o = n.originalEvent.target,
    a = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  (t && o.addEventListener(e, t, { once: !0 }), r ? Ur(o, a) : o.dispatchEvent(a));
}
var Qe = "focusScope.autoFocusOnMount",
  Je = "focusScope.autoFocusOnUnmount",
  It = { bubbles: !1, cancelable: !0 },
  Zr = "FocusScope",
  Jt = s.forwardRef((e, t) => {
    const { loop: n = !1, trapped: r = !1, onMountAutoFocus: o, onUnmountAutoFocus: a, ...l } = e,
      [i, p] = s.useState(null),
      u = De(o),
      f = De(a),
      d = s.useRef(null),
      v = ue(t, (m) => p(m)),
      E = s.useRef({
        paused: !1,
        pause() {
          this.paused = !0;
        },
        resume() {
          this.paused = !1;
        },
      }).current;
    (s.useEffect(() => {
      if (r) {
        let m = function (R) {
            if (E.paused || !i) return;
            const y = R.target;
            i.contains(y) ? (d.current = y) : ae(d.current, { select: !0 });
          },
          b = function (R) {
            if (E.paused || !i) return;
            const y = R.relatedTarget;
            y !== null && (i.contains(y) || ae(d.current, { select: !0 }));
          },
          g = function (R) {
            if (document.activeElement === document.body)
              for (const A of R) A.removedNodes.length > 0 && ae(i);
          };
        (document.addEventListener("focusin", m), document.addEventListener("focusout", b));
        const C = new MutationObserver(g);
        return (
          i && C.observe(i, { childList: !0, subtree: !0 }),
          () => {
            (document.removeEventListener("focusin", m),
              document.removeEventListener("focusout", b),
              C.disconnect());
          }
        );
      }
    }, [r, i, E.paused]),
      s.useEffect(() => {
        if (i) {
          _t.add(E);
          const m = document.activeElement;
          if (!i.contains(m)) {
            const g = new CustomEvent(Qe, It);
            (i.addEventListener(Qe, u),
              i.dispatchEvent(g),
              g.defaultPrevented ||
                (Qr(ro(en(i)), { select: !0 }), document.activeElement === m && ae(i)));
          }
          return () => {
            (i.removeEventListener(Qe, u),
              setTimeout(() => {
                const g = new CustomEvent(Je, It);
                (i.addEventListener(Je, f),
                  i.dispatchEvent(g),
                  g.defaultPrevented || ae(m ?? document.body, { select: !0 }),
                  i.removeEventListener(Je, f),
                  _t.remove(E));
              }, 0));
          };
        }
      }, [i, u, f, E]));
    const T = s.useCallback(
      (m) => {
        if ((!n && !r) || E.paused) return;
        const b = m.key === "Tab" && !m.altKey && !m.ctrlKey && !m.metaKey,
          g = document.activeElement;
        if (b && g) {
          const C = m.currentTarget,
            [R, y] = Jr(C);
          R && y
            ? !m.shiftKey && g === y
              ? (m.preventDefault(), n && ae(R, { select: !0 }))
              : m.shiftKey && g === R && (m.preventDefault(), n && ae(y, { select: !0 }))
            : g === C && m.preventDefault();
        }
      },
      [n, r, E.paused],
    );
    return c.jsx(ee.div, { tabIndex: -1, ...l, ref: v, onKeyDown: T });
  });
Jt.displayName = Zr;
function Qr(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e) if ((ae(r, { select: t }), document.activeElement !== n)) return;
}
function Jr(e) {
  const t = en(e),
    n = jt(t, e),
    r = jt(t.reverse(), e);
  return [n, r];
}
function en(e) {
  const t = [],
    n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (r) => {
        const o = r.tagName === "INPUT" && r.type === "hidden";
        return r.disabled || r.hidden || o
          ? NodeFilter.FILTER_SKIP
          : r.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
      },
    });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function jt(e, t) {
  for (const n of e) if (!eo(n, { upTo: t })) return n;
}
function eo(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function to(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function ae(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    (e.focus({ preventScroll: !0 }), e !== n && to(e) && t && e.select());
  }
}
var _t = no();
function no() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      (t !== n && n?.pause(), (e = kt(e, t)), e.unshift(t));
    },
    remove(t) {
      ((e = kt(e, t)), e[0]?.resume());
    },
  };
}
function kt(e, t) {
  const n = [...e],
    r = n.indexOf(t);
  return (r !== -1 && n.splice(r, 1), n);
}
function ro(e) {
  return e.filter((t) => t.tagName !== "A");
}
var oo = "Portal",
  tn = s.forwardRef((e, t) => {
    const { container: n, ...r } = e,
      [o, a] = s.useState(!1);
    Re(() => a(!0), []);
    const l = n || (o && globalThis?.document?.body);
    return l ? fr.createPortal(c.jsx(ee.div, { ...r, ref: t }), l) : null;
  });
tn.displayName = oo;
function ao(e, t) {
  return s.useReducer((n, r) => t[n][r] ?? n, e);
}
var Ue = (e) => {
  const { present: t, children: n } = e,
    r = io(t),
    o = typeof n == "function" ? n({ present: r.isPresent }) : s.Children.only(n),
    a = ue(r.ref, so(o));
  return typeof n == "function" || r.isPresent ? s.cloneElement(o, { ref: a }) : null;
};
Ue.displayName = "Presence";
function io(e) {
  const [t, n] = s.useState(),
    r = s.useRef(null),
    o = s.useRef(e),
    a = s.useRef("none"),
    l = e ? "mounted" : "unmounted",
    [i, p] = ao(l, {
      mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
      unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
      unmounted: { MOUNT: "mounted" },
    });
  return (
    s.useEffect(() => {
      const u = Me(r.current);
      a.current = i === "mounted" ? u : "none";
    }, [i]),
    Re(() => {
      const u = r.current,
        f = o.current;
      if (f !== e) {
        const v = a.current,
          E = Me(u);
        (e
          ? p("MOUNT")
          : E === "none" || u?.display === "none"
            ? p("UNMOUNT")
            : p(f && v !== E ? "ANIMATION_OUT" : "UNMOUNT"),
          (o.current = e));
      }
    }, [e, p]),
    Re(() => {
      if (t) {
        let u;
        const f = t.ownerDocument.defaultView ?? window,
          d = (E) => {
            const m = Me(r.current).includes(CSS.escape(E.animationName));
            if (E.target === t && m && (p("ANIMATION_END"), !o.current)) {
              const b = t.style.animationFillMode;
              ((t.style.animationFillMode = "forwards"),
                (u = f.setTimeout(() => {
                  t.style.animationFillMode === "forwards" && (t.style.animationFillMode = b);
                })));
            }
          },
          v = (E) => {
            E.target === t && (a.current = Me(r.current));
          };
        return (
          t.addEventListener("animationstart", v),
          t.addEventListener("animationcancel", d),
          t.addEventListener("animationend", d),
          () => {
            (f.clearTimeout(u),
              t.removeEventListener("animationstart", v),
              t.removeEventListener("animationcancel", d),
              t.removeEventListener("animationend", d));
          }
        );
      } else p("ANIMATION_END");
    }, [t, p]),
    {
      isPresent: ["mounted", "unmountSuspended"].includes(i),
      ref: s.useCallback((u) => {
        ((r.current = u ? getComputedStyle(u) : null), n(u));
      }, []),
    }
  );
}
function Me(e) {
  return e?.animationName || "none";
}
function so(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var et = 0;
function lo() {
  s.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return (
      document.body.insertAdjacentElement("afterbegin", e[0] ?? Lt()),
      document.body.insertAdjacentElement("beforeend", e[1] ?? Lt()),
      et++,
      () => {
        (et === 1 &&
          document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()),
          et--);
      }
    );
  }, []);
}
function Lt() {
  const e = document.createElement("span");
  return (
    e.setAttribute("data-radix-focus-guard", ""),
    (e.tabIndex = 0),
    (e.style.outline = "none"),
    (e.style.opacity = "0"),
    (e.style.position = "fixed"),
    (e.style.pointerEvents = "none"),
    e
  );
}
var Z = function () {
  return (
    (Z =
      Object.assign ||
      function (t) {
        for (var n, r = 1, o = arguments.length; r < o; r++) {
          n = arguments[r];
          for (var a in n) Object.prototype.hasOwnProperty.call(n, a) && (t[a] = n[a]);
        }
        return t;
      }),
    Z.apply(this, arguments)
  );
};
function nn(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++)
      t.indexOf(r[o]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, r[o]) &&
        (n[r[o]] = e[r[o]]);
  return n;
}
function co(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, o = t.length, a; r < o; r++)
      (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), (a[r] = t[r]));
  return e.concat(a || Array.prototype.slice.call(t));
}
var Fe = "right-scroll-bar-position",
  We = "width-before-scroll-bar",
  uo = "with-scroll-bars-hidden",
  fo = "--removed-body-scroll-bar-size";
function tt(e, t) {
  return (typeof e == "function" ? e(t) : e && (e.current = t), e);
}
function mo(e, t) {
  var n = s.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var o = n.value;
          o !== r && ((n.value = r), n.callback(r, o));
        },
      },
    };
  })[0];
  return ((n.callback = t), n.facade);
}
var po = typeof window < "u" ? s.useLayoutEffect : s.useEffect,
  $t = new WeakMap();
function vo(e, t) {
  var n = mo(null, function (r) {
    return e.forEach(function (o) {
      return tt(o, r);
    });
  });
  return (
    po(
      function () {
        var r = $t.get(n);
        if (r) {
          var o = new Set(r),
            a = new Set(e),
            l = n.current;
          (o.forEach(function (i) {
            a.has(i) || tt(i, null);
          }),
            a.forEach(function (i) {
              o.has(i) || tt(i, l);
            }));
        }
        $t.set(n, e);
      },
      [e],
    ),
    n
  );
}
function ho(e) {
  return e;
}
function go(e, t) {
  t === void 0 && (t = ho);
  var n = [],
    r = !1,
    o = {
      read: function () {
        if (r)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.",
          );
        return n.length ? n[n.length - 1] : e;
      },
      useMedium: function (a) {
        var l = t(a, r);
        return (
          n.push(l),
          function () {
            n = n.filter(function (i) {
              return i !== l;
            });
          }
        );
      },
      assignSyncMedium: function (a) {
        for (r = !0; n.length; ) {
          var l = n;
          ((n = []), l.forEach(a));
        }
        n = {
          push: function (i) {
            return a(i);
          },
          filter: function () {
            return n;
          },
        };
      },
      assignMedium: function (a) {
        r = !0;
        var l = [];
        if (n.length) {
          var i = n;
          ((n = []), i.forEach(a), (l = n));
        }
        var p = function () {
            var f = l;
            ((l = []), f.forEach(a));
          },
          u = function () {
            return Promise.resolve().then(p);
          };
        (u(),
          (n = {
            push: function (f) {
              (l.push(f), u());
            },
            filter: function (f) {
              return ((l = l.filter(f)), n);
            },
          }));
      },
    };
  return o;
}
function wo(e) {
  e === void 0 && (e = {});
  var t = go(null);
  return ((t.options = Z({ async: !0, ssr: !1 }, e)), t);
}
var rn = function (e) {
  var t = e.sideCar,
    n = nn(e, ["sideCar"]);
  if (!t) throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return s.createElement(r, Z({}, n));
};
rn.isSideCarExport = !0;
function yo(e, t) {
  return (e.useMedium(t), rn);
}
var on = wo(),
  nt = function () {},
  He = s.forwardRef(function (e, t) {
    var n = s.useRef(null),
      r = s.useState({ onScrollCapture: nt, onWheelCapture: nt, onTouchMoveCapture: nt }),
      o = r[0],
      a = r[1],
      l = e.forwardProps,
      i = e.children,
      p = e.className,
      u = e.removeScrollBar,
      f = e.enabled,
      d = e.shards,
      v = e.sideCar,
      E = e.noRelative,
      T = e.noIsolation,
      m = e.inert,
      b = e.allowPinchZoom,
      g = e.as,
      C = g === void 0 ? "div" : g,
      R = e.gapMode,
      y = nn(e, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noRelative",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      A = v,
      F = vo([n, t]),
      h = Z(Z({}, y), o);
    return s.createElement(
      s.Fragment,
      null,
      f &&
        s.createElement(A, {
          sideCar: on,
          removeScrollBar: u,
          shards: d,
          noRelative: E,
          noIsolation: T,
          inert: m,
          setCallbacks: a,
          allowPinchZoom: !!b,
          lockRef: n,
          gapMode: R,
        }),
      l
        ? s.cloneElement(s.Children.only(i), Z(Z({}, h), { ref: F }))
        : s.createElement(C, Z({}, h, { className: p, ref: F }), i),
    );
  });
He.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
He.classNames = { fullWidth: We, zeroRight: Fe };
var bo = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function Eo() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = bo();
  return (t && e.setAttribute("nonce", t), e);
}
function xo(e, t) {
  e.styleSheet ? (e.styleSheet.cssText = t) : e.appendChild(document.createTextNode(t));
}
function So(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Co = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        (e == 0 && (t = Eo()) && (xo(t, n), So(t)), e++);
      },
      remove: function () {
        (e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null)));
      },
    };
  },
  Ro = function () {
    var e = Co();
    return function (t, n) {
      s.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove();
            }
          );
        },
        [t && n],
      );
    };
  },
  an = function () {
    var e = Ro(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return (e(r, o), null);
      };
    return t;
  },
  Do = { left: 0, top: 0, right: 0, gap: 0 },
  rt = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  No = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [rt(n), rt(r), rt(o)];
  },
  To = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return Do;
    var t = No(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return { left: t[0], top: t[1], right: t[2], gap: Math.max(0, r - n + t[2] - t[0]) };
  },
  Oo = an(),
  ge = "data-scroll-locked",
  Po = function (e, t, n, r) {
    var o = e.left,
      a = e.top,
      l = e.right,
      i = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          uo,
          ` {
   overflow: hidden `,
        )
        .concat(
          r,
          `;
   padding-right: `,
        )
        .concat(i, "px ")
        .concat(
          r,
          `;
  }
  body[`,
        )
        .concat(
          ge,
          `] {
    overflow: hidden `,
        )
        .concat(
          r,
          `;
    overscroll-behavior: contain;
    `,
        )
        .concat(
          [
            t && "position: relative ".concat(r, ";"),
            n === "margin" &&
              `
    padding-left: `
                .concat(
                  o,
                  `px;
    padding-top: `,
                )
                .concat(
                  a,
                  `px;
    padding-right: `,
                )
                .concat(
                  l,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `,
                )
                .concat(i, "px ")
                .concat(
                  r,
                  `;
    `,
                ),
            n === "padding" && "padding-right: ".concat(i, "px ").concat(r, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`,
        )
        .concat(
          Fe,
          ` {
    right: `,
        )
        .concat(i, "px ")
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(
          We,
          ` {
    margin-right: `,
        )
        .concat(i, "px ")
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(Fe, " .")
        .concat(
          Fe,
          ` {
    right: 0 `,
        )
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(We, " .")
        .concat(
          We,
          ` {
    margin-right: 0 `,
        )
        .concat(
          r,
          `;
  }
  
  body[`,
        )
        .concat(
          ge,
          `] {
    `,
        )
        .concat(fo, ": ")
        .concat(
          i,
          `px;
  }
`,
        )
    );
  },
  Ft = function () {
    var e = parseInt(document.body.getAttribute(ge) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  Ao = function () {
    s.useEffect(function () {
      return (
        document.body.setAttribute(ge, (Ft() + 1).toString()),
        function () {
          var e = Ft() - 1;
          e <= 0 ? document.body.removeAttribute(ge) : document.body.setAttribute(ge, e.toString());
        }
      );
    }, []);
  },
  Mo = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? "margin" : r;
    Ao();
    var a = s.useMemo(
      function () {
        return To(o);
      },
      [o],
    );
    return s.createElement(Oo, { styles: Po(a, !t, o, n ? "" : "!important") });
  },
  ut = !1;
if (typeof window < "u")
  try {
    var Ie = Object.defineProperty({}, "passive", {
      get: function () {
        return ((ut = !0), !0);
      },
    });
    (window.addEventListener("test", Ie, Ie), window.removeEventListener("test", Ie, Ie));
  } catch {
    ut = !1;
  }
var pe = ut ? { passive: !1 } : !1,
  Io = function (e) {
    return e.tagName === "TEXTAREA";
  },
  sn = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Io(e) && n[t] === "visible");
  },
  jo = function (e) {
    return sn(e, "overflowY");
  },
  _o = function (e) {
    return sn(e, "overflowX");
  },
  Wt = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var o = ln(e, r);
      if (o) {
        var a = cn(e, r),
          l = a[1],
          i = a[2];
        if (l > i) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  ko = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Lo = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  ln = function (e, t) {
    return e === "v" ? jo(t) : _o(t);
  },
  cn = function (e, t) {
    return e === "v" ? ko(t) : Lo(t);
  },
  $o = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  Fo = function (e, t, n, r, o) {
    var a = $o(e, window.getComputedStyle(t).direction),
      l = a * r,
      i = n.target,
      p = t.contains(i),
      u = !1,
      f = l > 0,
      d = 0,
      v = 0;
    do {
      if (!i) break;
      var E = cn(e, i),
        T = E[0],
        m = E[1],
        b = E[2],
        g = m - b - a * T;
      (T || g) && ln(e, i) && ((d += g), (v += T));
      var C = i.parentNode;
      i = C && C.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? C.host : C;
    } while ((!p && i !== document.body) || (p && (t.contains(i) || t === i)));
    return (((f && Math.abs(d) < 1) || (!f && Math.abs(v) < 1)) && (u = !0), u);
  },
  je = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  Bt = function (e) {
    return [e.deltaX, e.deltaY];
  },
  Ut = function (e) {
    return e && "current" in e ? e.current : e;
  },
  Wo = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  Bo = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`,
      )
      .concat(
        e,
        ` {pointer-events: all;}
`,
      );
  },
  Uo = 0,
  ve = [];
function Ho(e) {
  var t = s.useRef([]),
    n = s.useRef([0, 0]),
    r = s.useRef(),
    o = s.useState(Uo++)[0],
    a = s.useState(an)[0],
    l = s.useRef(e);
  (s.useEffect(
    function () {
      l.current = e;
    },
    [e],
  ),
    s.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(o));
          var m = co([e.lockRef.current], (e.shards || []).map(Ut), !0).filter(Boolean);
          return (
            m.forEach(function (b) {
              return b.classList.add("allow-interactivity-".concat(o));
            }),
            function () {
              (document.body.classList.remove("block-interactivity-".concat(o)),
                m.forEach(function (b) {
                  return b.classList.remove("allow-interactivity-".concat(o));
                }));
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards],
    ));
  var i = s.useCallback(function (m, b) {
      if (("touches" in m && m.touches.length === 2) || (m.type === "wheel" && m.ctrlKey))
        return !l.current.allowPinchZoom;
      var g = je(m),
        C = n.current,
        R = "deltaX" in m ? m.deltaX : C[0] - g[0],
        y = "deltaY" in m ? m.deltaY : C[1] - g[1],
        A,
        F = m.target,
        h = Math.abs(R) > Math.abs(y) ? "h" : "v";
      if ("touches" in m && h === "h" && F.type === "range") return !1;
      var O = window.getSelection(),
        N = O && O.anchorNode,
        _ = N ? N === F || N.contains(F) : !1;
      if (_) return !1;
      var k = Wt(h, F);
      if (!k) return !0;
      if ((k ? (A = h) : ((A = h === "v" ? "h" : "v"), (k = Wt(h, F))), !k)) return !1;
      if ((!r.current && "changedTouches" in m && (R || y) && (r.current = A), !A)) return !0;
      var U = r.current || A;
      return Fo(U, b, m, U === "h" ? R : y);
    }, []),
    p = s.useCallback(function (m) {
      var b = m;
      if (!(!ve.length || ve[ve.length - 1] !== a)) {
        var g = "deltaY" in b ? Bt(b) : je(b),
          C = t.current.filter(function (A) {
            return (
              A.name === b.type &&
              (A.target === b.target || b.target === A.shadowParent) &&
              Wo(A.delta, g)
            );
          })[0];
        if (C && C.should) {
          b.cancelable && b.preventDefault();
          return;
        }
        if (!C) {
          var R = (l.current.shards || [])
              .map(Ut)
              .filter(Boolean)
              .filter(function (A) {
                return A.contains(b.target);
              }),
            y = R.length > 0 ? i(b, R[0]) : !l.current.noIsolation;
          y && b.cancelable && b.preventDefault();
        }
      }
    }, []),
    u = s.useCallback(function (m, b, g, C) {
      var R = { name: m, delta: b, target: g, should: C, shadowParent: zo(g) };
      (t.current.push(R),
        setTimeout(function () {
          t.current = t.current.filter(function (y) {
            return y !== R;
          });
        }, 1));
    }, []),
    f = s.useCallback(function (m) {
      ((n.current = je(m)), (r.current = void 0));
    }, []),
    d = s.useCallback(function (m) {
      u(m.type, Bt(m), m.target, i(m, e.lockRef.current));
    }, []),
    v = s.useCallback(function (m) {
      u(m.type, je(m), m.target, i(m, e.lockRef.current));
    }, []);
  s.useEffect(function () {
    return (
      ve.push(a),
      e.setCallbacks({ onScrollCapture: d, onWheelCapture: d, onTouchMoveCapture: v }),
      document.addEventListener("wheel", p, pe),
      document.addEventListener("touchmove", p, pe),
      document.addEventListener("touchstart", f, pe),
      function () {
        ((ve = ve.filter(function (m) {
          return m !== a;
        })),
          document.removeEventListener("wheel", p, pe),
          document.removeEventListener("touchmove", p, pe),
          document.removeEventListener("touchstart", f, pe));
      }
    );
  }, []);
  var E = e.removeScrollBar,
    T = e.inert;
  return s.createElement(
    s.Fragment,
    null,
    T ? s.createElement(a, { styles: Bo(o) }) : null,
    E ? s.createElement(Mo, { noRelative: e.noRelative, gapMode: e.gapMode }) : null,
  );
}
function zo(e) {
  for (var t = null; e !== null; )
    (e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode));
  return t;
}
const Vo = yo(on, Ho);
var un = s.forwardRef(function (e, t) {
  return s.createElement(He, Z({}, e, { ref: t, sideCar: Vo }));
});
un.classNames = He.classNames;
var Yo = function (e) {
    if (typeof document > "u") return null;
    var t = Array.isArray(e) ? e[0] : e;
    return t.ownerDocument.body;
  },
  he = new WeakMap(),
  _e = new WeakMap(),
  ke = {},
  ot = 0,
  dn = function (e) {
    return e && (e.host || dn(e.parentNode));
  },
  Xo = function (e, t) {
    return t
      .map(function (n) {
        if (e.contains(n)) return n;
        var r = dn(n);
        return r && e.contains(r)
          ? r
          : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"),
            null);
      })
      .filter(function (n) {
        return !!n;
      });
  },
  Ko = function (e, t, n, r) {
    var o = Xo(t, Array.isArray(e) ? e : [e]);
    ke[n] || (ke[n] = new WeakMap());
    var a = ke[n],
      l = [],
      i = new Set(),
      p = new Set(o),
      u = function (d) {
        !d || i.has(d) || (i.add(d), u(d.parentNode));
      };
    o.forEach(u);
    var f = function (d) {
      !d ||
        p.has(d) ||
        Array.prototype.forEach.call(d.children, function (v) {
          if (i.has(v)) f(v);
          else
            try {
              var E = v.getAttribute(r),
                T = E !== null && E !== "false",
                m = (he.get(v) || 0) + 1,
                b = (a.get(v) || 0) + 1;
              (he.set(v, m),
                a.set(v, b),
                l.push(v),
                m === 1 && T && _e.set(v, !0),
                b === 1 && v.setAttribute(n, "true"),
                T || v.setAttribute(r, "true"));
            } catch (g) {
              console.error("aria-hidden: cannot operate on ", v, g);
            }
        });
    };
    return (
      f(t),
      i.clear(),
      ot++,
      function () {
        (l.forEach(function (d) {
          var v = he.get(d) - 1,
            E = a.get(d) - 1;
          (he.set(d, v),
            a.set(d, E),
            v || (_e.has(d) || d.removeAttribute(r), _e.delete(d)),
            E || d.removeAttribute(n));
        }),
          ot--,
          ot || ((he = new WeakMap()), (he = new WeakMap()), (_e = new WeakMap()), (ke = {})));
      }
    );
  },
  qo = function (e, t, n) {
    n === void 0 && (n = "data-aria-hidden");
    var r = Array.from(Array.isArray(e) ? e : [e]),
      o = Yo(e);
    return o
      ? (r.push.apply(r, Array.from(o.querySelectorAll("[aria-live], script"))),
        Ko(r, o, n, "aria-hidden"))
      : function () {
          return null;
        };
  };
function Go(e) {
  const t = Zo(e),
    n = s.forwardRef((r, o) => {
      const { children: a, ...l } = r,
        i = s.Children.toArray(a),
        p = i.find(Jo);
      if (p) {
        const u = p.props.children,
          f = i.map((d) =>
            d === p
              ? s.Children.count(u) > 1
                ? s.Children.only(null)
                : s.isValidElement(u)
                  ? u.props.children
                  : null
              : d,
          );
        return c.jsx(t, {
          ...l,
          ref: o,
          children: s.isValidElement(u) ? s.cloneElement(u, void 0, f) : null,
        });
      }
      return c.jsx(t, { ...l, ref: o, children: a });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
function Zo(e) {
  const t = s.forwardRef((n, r) => {
    const { children: o, ...a } = n;
    if (s.isValidElement(o)) {
      const l = ta(o),
        i = ea(a, o.props);
      return (o.type !== s.Fragment && (i.ref = r ? qt(r, l) : l), s.cloneElement(o, i));
    }
    return s.Children.count(o) > 1 ? s.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var Qo = Symbol("radix.slottable");
function Jo(e) {
  return (
    s.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === Qo
  );
}
function ea(e, t) {
  const n = { ...t };
  for (const r in t) {
    const o = e[r],
      a = t[r];
    /^on[A-Z]/.test(r)
      ? o && a
        ? (n[r] = (...i) => {
            const p = a(...i);
            return (o(...i), p);
          })
        : o && (n[r] = o)
      : r === "style"
        ? (n[r] = { ...o, ...a })
        : r === "className" && (n[r] = [o, a].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function ta(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var ze = "Dialog",
  [fn] = Nr(ze),
  [na, q] = fn(ze),
  mn = (e) => {
    const {
        __scopeDialog: t,
        children: n,
        open: r,
        defaultOpen: o,
        onOpenChange: a,
        modal: l = !0,
      } = e,
      i = s.useRef(null),
      p = s.useRef(null),
      [u, f] = Mr({ prop: r, defaultProp: o ?? !1, onChange: a, caller: ze });
    return c.jsx(na, {
      scope: t,
      triggerRef: i,
      contentRef: p,
      contentId: Ze(),
      titleId: Ze(),
      descriptionId: Ze(),
      open: u,
      onOpenChange: f,
      onOpenToggle: s.useCallback(() => f((d) => !d), [f]),
      modal: l,
      children: n,
    });
  };
mn.displayName = ze;
var pn = "DialogTrigger",
  ra = s.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = q(pn, n),
      a = ue(t, o.triggerRef);
    return c.jsx(ee.button, {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": o.open,
      "aria-controls": o.contentId,
      "data-state": vt(o.open),
      ...r,
      ref: a,
      onClick: ie(e.onClick, o.onOpenToggle),
    });
  });
ra.displayName = pn;
var mt = "DialogPortal",
  [oa, vn] = fn(mt, { forceMount: void 0 }),
  hn = (e) => {
    const { __scopeDialog: t, forceMount: n, children: r, container: o } = e,
      a = q(mt, t);
    return c.jsx(oa, {
      scope: t,
      forceMount: n,
      children: s.Children.map(r, (l) =>
        c.jsx(Ue, {
          present: n || a.open,
          children: c.jsx(tn, { asChild: !0, container: o, children: l }),
        }),
      ),
    });
  };
hn.displayName = mt;
var Be = "DialogOverlay",
  gn = s.forwardRef((e, t) => {
    const n = vn(Be, e.__scopeDialog),
      { forceMount: r = n.forceMount, ...o } = e,
      a = q(Be, e.__scopeDialog);
    return a.modal
      ? c.jsx(Ue, { present: r || a.open, children: c.jsx(ia, { ...o, ref: t }) })
      : null;
  });
gn.displayName = Be;
var aa = Go("DialogOverlay.RemoveScroll"),
  ia = s.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = q(Be, n);
    return c.jsx(un, {
      as: aa,
      allowPinchZoom: !0,
      shards: [o.contentRef],
      children: c.jsx(ee.div, {
        "data-state": vt(o.open),
        ...r,
        ref: t,
        style: { pointerEvents: "auto", ...r.style },
      }),
    });
  }),
  ce = "DialogContent",
  wn = s.forwardRef((e, t) => {
    const n = vn(ce, e.__scopeDialog),
      { forceMount: r = n.forceMount, ...o } = e,
      a = q(ce, e.__scopeDialog);
    return c.jsx(Ue, {
      present: r || a.open,
      children: a.modal ? c.jsx(sa, { ...o, ref: t }) : c.jsx(la, { ...o, ref: t }),
    });
  });
wn.displayName = ce;
var sa = s.forwardRef((e, t) => {
    const n = q(ce, e.__scopeDialog),
      r = s.useRef(null),
      o = ue(t, n.contentRef, r);
    return (
      s.useEffect(() => {
        const a = r.current;
        if (a) return qo(a);
      }, []),
      c.jsx(yn, {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: ie(e.onCloseAutoFocus, (a) => {
          (a.preventDefault(), n.triggerRef.current?.focus());
        }),
        onPointerDownOutside: ie(e.onPointerDownOutside, (a) => {
          const l = a.detail.originalEvent,
            i = l.button === 0 && l.ctrlKey === !0;
          (l.button === 2 || i) && a.preventDefault();
        }),
        onFocusOutside: ie(e.onFocusOutside, (a) => a.preventDefault()),
      })
    );
  }),
  la = s.forwardRef((e, t) => {
    const n = q(ce, e.__scopeDialog),
      r = s.useRef(!1),
      o = s.useRef(!1);
    return c.jsx(yn, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: (a) => {
        (e.onCloseAutoFocus?.(a),
          a.defaultPrevented || (r.current || n.triggerRef.current?.focus(), a.preventDefault()),
          (r.current = !1),
          (o.current = !1));
      },
      onInteractOutside: (a) => {
        (e.onInteractOutside?.(a),
          a.defaultPrevented ||
            ((r.current = !0), a.detail.originalEvent.type === "pointerdown" && (o.current = !0)));
        const l = a.target;
        (n.triggerRef.current?.contains(l) && a.preventDefault(),
          a.detail.originalEvent.type === "focusin" && o.current && a.preventDefault());
      },
    });
  }),
  yn = s.forwardRef((e, t) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: o, onCloseAutoFocus: a, ...l } = e,
      i = q(ce, n),
      p = s.useRef(null),
      u = ue(t, p);
    return (
      lo(),
      c.jsxs(c.Fragment, {
        children: [
          c.jsx(Jt, {
            asChild: !0,
            loop: !0,
            trapped: r,
            onMountAutoFocus: o,
            onUnmountAutoFocus: a,
            children: c.jsx(Zt, {
              role: "dialog",
              id: i.contentId,
              "aria-describedby": i.descriptionId,
              "aria-labelledby": i.titleId,
              "data-state": vt(i.open),
              ...l,
              ref: u,
              onDismiss: () => i.onOpenChange(!1),
            }),
          }),
          c.jsxs(c.Fragment, {
            children: [
              c.jsx(ca, { titleId: i.titleId }),
              c.jsx(da, { contentRef: p, descriptionId: i.descriptionId }),
            ],
          }),
        ],
      })
    );
  }),
  pt = "DialogTitle",
  bn = s.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = q(pt, n);
    return c.jsx(ee.h2, { id: o.titleId, ...r, ref: t });
  });
bn.displayName = pt;
var En = "DialogDescription",
  xn = s.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = q(En, n);
    return c.jsx(ee.p, { id: o.descriptionId, ...r, ref: t });
  });
xn.displayName = En;
var Sn = "DialogClose",
  Cn = s.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = q(Sn, n);
    return c.jsx(ee.button, {
      type: "button",
      ...r,
      ref: t,
      onClick: ie(e.onClick, () => o.onOpenChange(!1)),
    });
  });
Cn.displayName = Sn;
function vt(e) {
  return e ? "open" : "closed";
}
var Rn = "DialogTitleWarning",
  [Qa, Dn] = Dr(Rn, { contentName: ce, titleName: pt, docsSlug: "dialog" }),
  ca = ({ titleId: e }) => {
    const t = Dn(Rn),
      n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
    return (
      s.useEffect(() => {
        e && (document.getElementById(e) || console.error(n));
      }, [n, e]),
      null
    );
  },
  ua = "DialogDescriptionWarning",
  da = ({ contentRef: e, descriptionId: t }) => {
    const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${Dn(ua).contentName}}.`;
    return (
      s.useEffect(() => {
        const o = e.current?.getAttribute("aria-describedby");
        t && o && (document.getElementById(t) || console.warn(r));
      }, [r, e, t]),
      null
    );
  },
  Nn = mn,
  Tn = hn,
  ht = gn,
  gt = wn,
  wt = bn,
  yt = xn,
  fa = Cn;
const ma = Nn,
  pa = Tn,
  On = s.forwardRef(({ className: e, ...t }, n) =>
    c.jsx(ht, {
      ref: n,
      className: Q(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        e,
      ),
      ...t,
    }),
  );
On.displayName = ht.displayName;
const Pn = s.forwardRef(({ className: e, children: t, ...n }, r) =>
  c.jsxs(pa, {
    children: [
      c.jsx(On, {}),
      c.jsxs(gt, {
        ref: r,
        className: Q(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
          e,
        ),
        ...n,
        children: [
          t,
          c.jsxs(fa, {
            className:
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            children: [
              c.jsx(yr, { className: "h-4 w-4" }),
              c.jsx("span", { className: "sr-only", children: "Close" }),
            ],
          }),
        ],
      }),
    ],
  }),
);
Pn.displayName = gt.displayName;
const An = ({ className: e, ...t }) =>
  c.jsx("div", { className: Q("flex flex-col space-y-1.5 text-center sm:text-left", e), ...t });
An.displayName = "DialogHeader";
const Mn = s.forwardRef(({ className: e, ...t }, n) =>
  c.jsx(wt, { ref: n, className: Q("text-lg font-semibold leading-none tracking-tight", e), ...t }),
);
Mn.displayName = wt.displayName;
const In = s.forwardRef(({ className: e, ...t }, n) =>
  c.jsx(yt, { ref: n, className: Q("text-sm text-muted-foreground", e), ...t }),
);
In.displayName = yt.displayName;
function va(e) {
  if (typeof document > "u") return;
  let t = document.head || document.getElementsByTagName("head")[0],
    n = document.createElement("style");
  ((n.type = "text/css"),
    t.appendChild(n),
    n.styleSheet ? (n.styleSheet.cssText = e) : n.appendChild(document.createTextNode(e)));
}
const jn = w.createContext({
    drawerRef: { current: null },
    overlayRef: { current: null },
    onPress: () => {},
    onRelease: () => {},
    onDrag: () => {},
    onNestedDrag: () => {},
    onNestedOpenChange: () => {},
    onNestedRelease: () => {},
    openProp: void 0,
    dismissible: !1,
    isOpen: !1,
    isDragging: !1,
    keyboardIsOpen: { current: !1 },
    snapPointsOffset: null,
    snapPoints: null,
    handleOnly: !1,
    modal: !1,
    shouldFade: !1,
    activeSnapPoint: null,
    onOpenChange: () => {},
    setActiveSnapPoint: () => {},
    closeDrawer: () => {},
    direction: "bottom",
    shouldAnimate: { current: !0 },
    shouldScaleBackground: !1,
    setBackgroundColorOnScale: !0,
    noBodyStyles: !1,
    container: null,
    autoFocus: !1,
  }),
  Ne = () => {
    const e = w.useContext(jn);
    if (!e) throw new Error("useDrawerContext must be used within a Drawer.Root");
    return e;
  };
va(`[data-vaul-drawer]{touch-action:none;will-change:transform;transition:transform .5s cubic-bezier(.32, .72, 0, 1);animation-duration:.5s;animation-timing-function:cubic-bezier(0.32,0.72,0,1)}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=bottom][data-state=open]{animation-name:slideFromBottom}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=bottom][data-state=closed]{animation-name:slideToBottom}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=top][data-state=open]{animation-name:slideFromTop}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=top][data-state=closed]{animation-name:slideToTop}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=left][data-state=open]{animation-name:slideFromLeft}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=left][data-state=closed]{animation-name:slideToLeft}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=right][data-state=open]{animation-name:slideFromRight}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=right][data-state=closed]{animation-name:slideToRight}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=bottom]{transform:translate3d(0,var(--initial-transform,100%),0)}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=top]{transform:translate3d(0,calc(var(--initial-transform,100%) * -1),0)}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=left]{transform:translate3d(calc(var(--initial-transform,100%) * -1),0,0)}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=right]{transform:translate3d(var(--initial-transform,100%),0,0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=top]{transform:translate3d(0,var(--snap-point-height,0),0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=bottom]{transform:translate3d(0,var(--snap-point-height,0),0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=left]{transform:translate3d(var(--snap-point-height,0),0,0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=right]{transform:translate3d(var(--snap-point-height,0),0,0)}[data-vaul-overlay][data-vaul-snap-points=false]{animation-duration:.5s;animation-timing-function:cubic-bezier(0.32,0.72,0,1)}[data-vaul-overlay][data-vaul-snap-points=false][data-state=open]{animation-name:fadeIn}[data-vaul-overlay][data-state=closed]{animation-name:fadeOut}[data-vaul-animate=false]{animation:none!important}[data-vaul-overlay][data-vaul-snap-points=true]{opacity:0;transition:opacity .5s cubic-bezier(.32, .72, 0, 1)}[data-vaul-overlay][data-vaul-snap-points=true]{opacity:1}[data-vaul-drawer]:not([data-vaul-custom-container=true])::after{content:'';position:absolute;background:inherit;background-color:inherit}[data-vaul-drawer][data-vaul-drawer-direction=top]::after{top:initial;bottom:100%;left:0;right:0;height:200%}[data-vaul-drawer][data-vaul-drawer-direction=bottom]::after{top:100%;bottom:initial;left:0;right:0;height:200%}[data-vaul-drawer][data-vaul-drawer-direction=left]::after{left:initial;right:100%;top:0;bottom:0;width:200%}[data-vaul-drawer][data-vaul-drawer-direction=right]::after{left:100%;right:initial;top:0;bottom:0;width:200%}[data-vaul-overlay][data-vaul-snap-points=true]:not([data-vaul-snap-points-overlay=true]):not(
[data-state=closed]
){opacity:0}[data-vaul-overlay][data-vaul-snap-points-overlay=true]{opacity:1}[data-vaul-handle]{display:block;position:relative;opacity:.7;background:#e2e2e4;margin-left:auto;margin-right:auto;height:5px;width:32px;border-radius:1rem;touch-action:pan-y}[data-vaul-handle]:active,[data-vaul-handle]:hover{opacity:1}[data-vaul-handle-hitarea]{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100%,2.75rem);height:max(100%,2.75rem);touch-action:inherit}@media (hover:hover) and (pointer:fine){[data-vaul-drawer]{user-select:none}}@media (pointer:fine){[data-vaul-handle-hitarea]:{width:100%;height:100%}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeOut{to{opacity:0}}@keyframes slideFromBottom{from{transform:translate3d(0,var(--initial-transform,100%),0)}to{transform:translate3d(0,0,0)}}@keyframes slideToBottom{to{transform:translate3d(0,var(--initial-transform,100%),0)}}@keyframes slideFromTop{from{transform:translate3d(0,calc(var(--initial-transform,100%) * -1),0)}to{transform:translate3d(0,0,0)}}@keyframes slideToTop{to{transform:translate3d(0,calc(var(--initial-transform,100%) * -1),0)}}@keyframes slideFromLeft{from{transform:translate3d(calc(var(--initial-transform,100%) * -1),0,0)}to{transform:translate3d(0,0,0)}}@keyframes slideToLeft{to{transform:translate3d(calc(var(--initial-transform,100%) * -1),0,0)}}@keyframes slideFromRight{from{transform:translate3d(var(--initial-transform,100%),0,0)}to{transform:translate3d(0,0,0)}}@keyframes slideToRight{to{transform:translate3d(var(--initial-transform,100%),0,0)}}`);
function ha() {
  const e = navigator.userAgent;
  return typeof window < "u" && ((/Firefox/.test(e) && /Mobile/.test(e)) || /FxiOS/.test(e));
}
function ga() {
  return bt(/^Mac/);
}
function wa() {
  return bt(/^iPhone/);
}
function Ht() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function ya() {
  return bt(/^iPad/) || (ga() && navigator.maxTouchPoints > 1);
}
function _n() {
  return wa() || ya();
}
function bt(e) {
  return typeof window < "u" && window.navigator != null
    ? e.test(window.navigator.platform)
    : void 0;
}
const ba = 24,
  Ea = typeof window < "u" ? s.useLayoutEffect : s.useEffect;
function zt(...e) {
  return (...t) => {
    for (let n of e) typeof n == "function" && n(...t);
  };
}
const at = typeof document < "u" && window.visualViewport;
function Vt(e) {
  let t = window.getComputedStyle(e);
  return /(auto|scroll)/.test(t.overflow + t.overflowX + t.overflowY);
}
function kn(e) {
  for (Vt(e) && (e = e.parentElement); e && !Vt(e); ) e = e.parentElement;
  return e || document.scrollingElement || document.documentElement;
}
const xa = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);
let Le = 0,
  it;
function Sa(e = {}) {
  let { isDisabled: t } = e;
  Ea(() => {
    if (!t)
      return (
        Le++,
        Le === 1 && _n() && (it = Ca()),
        () => {
          (Le--, Le === 0 && it?.());
        }
      );
  }, [t]);
}
function Ca() {
  let e,
    t = 0,
    n = (d) => {
      ((e = kn(d.target)),
        !(e === document.documentElement && e === document.body) &&
          (t = d.changedTouches[0].pageY));
    },
    r = (d) => {
      if (!e || e === document.documentElement || e === document.body) {
        d.preventDefault();
        return;
      }
      let v = d.changedTouches[0].pageY,
        E = e.scrollTop,
        T = e.scrollHeight - e.clientHeight;
      T !== 0 && (((E <= 0 && v > t) || (E >= T && v < t)) && d.preventDefault(), (t = v));
    },
    o = (d) => {
      let v = d.target;
      dt(v) &&
        v !== document.activeElement &&
        (d.preventDefault(),
        (v.style.transform = "translateY(-2000px)"),
        v.focus(),
        requestAnimationFrame(() => {
          v.style.transform = "";
        }));
    },
    a = (d) => {
      let v = d.target;
      dt(v) &&
        ((v.style.transform = "translateY(-2000px)"),
        requestAnimationFrame(() => {
          ((v.style.transform = ""),
            at &&
              (at.height < window.innerHeight
                ? requestAnimationFrame(() => {
                    Yt(v);
                  })
                : at.addEventListener("resize", () => Yt(v), { once: !0 })));
        }));
    },
    l = () => {
      window.scrollTo(0, 0);
    },
    i = window.pageXOffset,
    p = window.pageYOffset,
    u = zt(
      Ra(
        document.documentElement,
        "paddingRight",
        `${window.innerWidth - document.documentElement.clientWidth}px`,
      ),
    );
  window.scrollTo(0, 0);
  let f = zt(
    Se(document, "touchstart", n, { passive: !1, capture: !0 }),
    Se(document, "touchmove", r, { passive: !1, capture: !0 }),
    Se(document, "touchend", o, { passive: !1, capture: !0 }),
    Se(document, "focus", a, !0),
    Se(window, "scroll", l),
  );
  return () => {
    (u(), f(), window.scrollTo(i, p));
  };
}
function Ra(e, t, n) {
  let r = e.style[t];
  return (
    (e.style[t] = n),
    () => {
      e.style[t] = r;
    }
  );
}
function Se(e, t, n, r) {
  return (
    e.addEventListener(t, n, r),
    () => {
      e.removeEventListener(t, n, r);
    }
  );
}
function Yt(e) {
  let t = document.scrollingElement || document.documentElement;
  for (; e && e !== t; ) {
    let n = kn(e);
    if (n !== document.documentElement && n !== document.body && n !== e) {
      let r = n.getBoundingClientRect().top,
        o = e.getBoundingClientRect().top,
        a = e.getBoundingClientRect().bottom;
      const l = n.getBoundingClientRect().bottom + ba;
      a > l && (n.scrollTop += o - r);
    }
    e = n.parentElement;
  }
}
function dt(e) {
  return (
    (e instanceof HTMLInputElement && !xa.has(e.type)) ||
    e instanceof HTMLTextAreaElement ||
    (e instanceof HTMLElement && e.isContentEditable)
  );
}
function Da(e, t) {
  typeof e == "function" ? e(t) : e != null && (e.current = t);
}
function Na(...e) {
  return (t) => e.forEach((n) => Da(n, t));
}
function Ln(...e) {
  return s.useCallback(Na(...e), e);
}
const $n = new WeakMap();
function W(e, t, n = !1) {
  if (!e || !(e instanceof HTMLElement)) return;
  let r = {};
  (Object.entries(t).forEach(([o, a]) => {
    if (o.startsWith("--")) {
      e.style.setProperty(o, a);
      return;
    }
    ((r[o] = e.style[o]), (e.style[o] = a));
  }),
    !n && $n.set(e, r));
}
function Ta(e, t) {
  if (!e || !(e instanceof HTMLElement)) return;
  let n = $n.get(e);
  n && (e.style[t] = n[t]);
}
const $ = (e) => {
  switch (e) {
    case "top":
    case "bottom":
      return !0;
    case "left":
    case "right":
      return !1;
    default:
      return e;
  }
};
function $e(e, t) {
  if (!e) return null;
  const n = window.getComputedStyle(e),
    r = n.transform || n.webkitTransform || n.mozTransform;
  let o = r.match(/^matrix3d\((.+)\)$/);
  return o
    ? parseFloat(o[1].split(", ")[$(t) ? 13 : 12])
    : ((o = r.match(/^matrix\((.+)\)$/)), o ? parseFloat(o[1].split(", ")[$(t) ? 5 : 4]) : null);
}
function Oa(e) {
  return 8 * (Math.log(e + 1) - 2);
}
function st(e, t) {
  if (!e) return () => {};
  const n = e.style.cssText;
  return (
    Object.assign(e.style, t),
    () => {
      e.style.cssText = n;
    }
  );
}
function Pa(...e) {
  return (...t) => {
    for (const n of e) typeof n == "function" && n(...t);
  };
}
const j = { DURATION: 0.5, EASE: [0.32, 0.72, 0, 1] },
  Fn = 0.4,
  Aa = 0.25,
  Ma = 100,
  Wn = 8,
  le = 16,
  ft = 26,
  lt = "vaul-dragging";
function Bn(e) {
  const t = w.useRef(e);
  return (
    w.useEffect(() => {
      t.current = e;
    }),
    w.useMemo(
      () =>
        (...n) =>
          t.current == null ? void 0 : t.current.call(t, ...n),
      [],
    )
  );
}
function Ia({ defaultProp: e, onChange: t }) {
  const n = w.useState(e),
    [r] = n,
    o = w.useRef(r),
    a = Bn(t);
  return (
    w.useEffect(() => {
      o.current !== r && (a(r), (o.current = r));
    }, [r, o, a]),
    n
  );
}
function Un({ prop: e, defaultProp: t, onChange: n = () => {} }) {
  const [r, o] = Ia({ defaultProp: t, onChange: n }),
    a = e !== void 0,
    l = a ? e : r,
    i = Bn(n),
    p = w.useCallback(
      (u) => {
        if (a) {
          const d = typeof u == "function" ? u(e) : u;
          d !== e && i(d);
        } else o(u);
      },
      [a, e, o, i],
    );
  return [l, p];
}
function ja({
  activeSnapPointProp: e,
  setActiveSnapPointProp: t,
  snapPoints: n,
  drawerRef: r,
  overlayRef: o,
  fadeFromIndex: a,
  onSnapPointChange: l,
  direction: i = "bottom",
  container: p,
  snapToSequentialPoint: u,
}) {
  const [f, d] = Un({ prop: e, defaultProp: n?.[0], onChange: t }),
    [v, E] = w.useState(
      typeof window < "u"
        ? { innerWidth: window.innerWidth, innerHeight: window.innerHeight }
        : void 0,
    );
  w.useEffect(() => {
    function h() {
      E({ innerWidth: window.innerWidth, innerHeight: window.innerHeight });
    }
    return (window.addEventListener("resize", h), () => window.removeEventListener("resize", h));
  }, []);
  const T = w.useMemo(() => f === n?.[n.length - 1] || null, [n, f]),
    m = w.useMemo(() => {
      var h;
      return (h = n?.findIndex((O) => O === f)) != null ? h : null;
    }, [n, f]),
    b = (n && n.length > 0 && (a || a === 0) && !Number.isNaN(a) && n[a] === f) || !n,
    g = w.useMemo(() => {
      const h = p
        ? { width: p.getBoundingClientRect().width, height: p.getBoundingClientRect().height }
        : typeof window < "u"
          ? { width: window.innerWidth, height: window.innerHeight }
          : { width: 0, height: 0 };
      var O;
      return (O = n?.map((N) => {
        const _ = typeof N == "string";
        let k = 0;
        if ((_ && (k = parseInt(N, 10)), $(i))) {
          const S = _ ? k : v ? N * h.height : 0;
          return v ? (i === "bottom" ? h.height - S : -h.height + S) : S;
        }
        const U = _ ? k : v ? N * h.width : 0;
        return v ? (i === "right" ? h.width - U : -h.width + U) : U;
      })) != null
        ? O
        : [];
    }, [n, v, p]),
    C = w.useMemo(() => (m !== null ? g?.[m] : null), [g, m]),
    R = w.useCallback(
      (h) => {
        var O;
        const N = (O = g?.findIndex((_) => _ === h)) != null ? O : null;
        (l(N),
          W(r.current, {
            transition: `transform ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
            transform: $(i) ? `translate3d(0, ${h}px, 0)` : `translate3d(${h}px, 0, 0)`,
          }),
          g && N !== g.length - 1 && a !== void 0 && N !== a && N < a
            ? W(o.current, {
                transition: `opacity ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
                opacity: "0",
              })
            : W(o.current, {
                transition: `opacity ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
                opacity: "1",
              }),
          d(n?.[Math.max(N, 0)]));
      },
      [r.current, n, g, a, o, d],
    );
  w.useEffect(() => {
    if (f || e) {
      var h;
      const O = (h = n?.findIndex((N) => N === e || N === f)) != null ? h : -1;
      g && O !== -1 && typeof g[O] == "number" && R(g[O]);
    }
  }, [f, e, n, g, R]);
  function y({ draggedDistance: h, closeDrawer: O, velocity: N, dismissible: _ }) {
    if (a === void 0) return;
    const k = i === "bottom" || i === "right" ? (C ?? 0) - h : (C ?? 0) + h,
      U = m === a - 1,
      S = m === 0,
      Y = h > 0;
    if (
      (U &&
        W(o.current, { transition: `opacity ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})` }),
      !u && N > 2 && !Y)
    ) {
      _ ? O() : R(g[0]);
      return;
    }
    if (!u && N > 2 && Y && g && n) {
      R(g[n.length - 1]);
      return;
    }
    const H = g?.reduce((B, J) =>
        typeof B != "number" || typeof J != "number"
          ? B
          : Math.abs(J - k) < Math.abs(B - k)
            ? J
            : B,
      ),
      X = $(i) ? window.innerHeight : window.innerWidth;
    if (N > Fn && Math.abs(h) < X * 0.4) {
      const B = Y ? 1 : -1;
      if (B > 0 && T && n) {
        R(g[n.length - 1]);
        return;
      }
      if ((S && B < 0 && _ && O(), m === null)) return;
      R(g[m + B]);
      return;
    }
    R(H);
  }
  function A({ draggedDistance: h }) {
    if (C === null) return;
    const O = i === "bottom" || i === "right" ? C - h : C + h;
    ((i === "bottom" || i === "right") && O < g[g.length - 1]) ||
      ((i === "top" || i === "left") && O > g[g.length - 1]) ||
      W(r.current, { transform: $(i) ? `translate3d(0, ${O}px, 0)` : `translate3d(${O}px, 0, 0)` });
  }
  function F(h, O) {
    if (!n || typeof m != "number" || !g || a === void 0) return null;
    const N = m === a - 1;
    if (m >= a && O) return 0;
    if (N && !O) return 1;
    if (!b && !N) return null;
    const k = N ? m + 1 : m - 1,
      U = N ? g[k] - g[k - 1] : g[k + 1] - g[k],
      S = h / Math.abs(U);
    return N ? 1 - S : S;
  }
  return {
    isLastSnapPoint: T,
    activeSnapPoint: f,
    shouldFade: b,
    getPercentageDragged: F,
    setActiveSnapPoint: d,
    activeSnapPointIndex: m,
    onRelease: y,
    onDrag: A,
    snapPointsOffset: g,
  };
}
const _a = () => () => {};
function ka() {
  const {
      direction: e,
      isOpen: t,
      shouldScaleBackground: n,
      setBackgroundColorOnScale: r,
      noBodyStyles: o,
    } = Ne(),
    a = w.useRef(null),
    l = s.useMemo(() => document.body.style.backgroundColor, []);
  function i() {
    return (window.innerWidth - ft) / window.innerWidth;
  }
  w.useEffect(() => {
    if (t && n) {
      a.current && clearTimeout(a.current);
      const p =
        document.querySelector("[data-vaul-drawer-wrapper]") ||
        document.querySelector("[vaul-drawer-wrapper]");
      if (!p) return;
      Pa(
        r && !o ? st(document.body, { background: "black" }) : _a,
        st(p, {
          transformOrigin: $(e) ? "top" : "left",
          transitionProperty: "transform, border-radius",
          transitionDuration: `${j.DURATION}s`,
          transitionTimingFunction: `cubic-bezier(${j.EASE.join(",")})`,
        }),
      );
      const u = st(p, {
        borderRadius: `${Wn}px`,
        overflow: "hidden",
        ...($(e)
          ? { transform: `scale(${i()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)` }
          : {
              transform: `scale(${i()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
            }),
      });
      return () => {
        (u(),
          (a.current = window.setTimeout(() => {
            l
              ? (document.body.style.background = l)
              : document.body.style.removeProperty("background");
          }, j.DURATION * 1e3)));
      };
    }
  }, [t, n, l]);
}
let Ce = null;
function La({
  isOpen: e,
  modal: t,
  nested: n,
  hasBeenOpened: r,
  preventScrollRestoration: o,
  noBodyStyles: a,
}) {
  const [l, i] = w.useState(() => (typeof window < "u" ? window.location.href : "")),
    p = w.useRef(0),
    u = w.useCallback(() => {
      if (Ht() && Ce === null && e && !a) {
        Ce = {
          position: document.body.style.position,
          top: document.body.style.top,
          left: document.body.style.left,
          height: document.body.style.height,
          right: "unset",
        };
        const { scrollX: d, innerHeight: v } = window;
        (document.body.style.setProperty("position", "fixed", "important"),
          Object.assign(document.body.style, {
            top: `${-p.current}px`,
            left: `${-d}px`,
            right: "0px",
            height: "auto",
          }),
          window.setTimeout(
            () =>
              window.requestAnimationFrame(() => {
                const E = v - window.innerHeight;
                E && p.current >= v && (document.body.style.top = `${-(p.current + E)}px`);
              }),
            300,
          ));
      }
    }, [e]),
    f = w.useCallback(() => {
      if (Ht() && Ce !== null && !a) {
        const d = -parseInt(document.body.style.top, 10),
          v = -parseInt(document.body.style.left, 10);
        (Object.assign(document.body.style, Ce),
          window.requestAnimationFrame(() => {
            if (o && l !== window.location.href) {
              i(window.location.href);
              return;
            }
            window.scrollTo(v, d);
          }),
          (Ce = null));
      }
    }, [l]);
  return (
    w.useEffect(() => {
      function d() {
        p.current = window.scrollY;
      }
      return (
        d(),
        window.addEventListener("scroll", d),
        () => {
          window.removeEventListener("scroll", d);
        }
      );
    }, []),
    w.useEffect(() => {
      if (t)
        return () => {
          typeof document > "u" || document.querySelector("[data-vaul-drawer]") || f();
        };
    }, [t, f]),
    w.useEffect(() => {
      n ||
        !r ||
        (e
          ? (!window.matchMedia("(display-mode: standalone)").matches && u(),
            t ||
              window.setTimeout(() => {
                f();
              }, 500))
          : f());
    }, [e, r, l, t, n, u, f]),
    { restorePositionSetting: f }
  );
}
function $a({
  open: e,
  onOpenChange: t,
  children: n,
  onDrag: r,
  onRelease: o,
  snapPoints: a,
  shouldScaleBackground: l = !1,
  setBackgroundColorOnScale: i = !0,
  closeThreshold: p = Aa,
  scrollLockTimeout: u = Ma,
  dismissible: f = !0,
  handleOnly: d = !1,
  fadeFromIndex: v = a && a.length - 1,
  activeSnapPoint: E,
  setActiveSnapPoint: T,
  fixed: m,
  modal: b = !0,
  onClose: g,
  nested: C,
  noBodyStyles: R = !1,
  direction: y = "bottom",
  defaultOpen: A = !1,
  disablePreventScroll: F = !0,
  snapToSequentialPoint: h = !1,
  preventScrollRestoration: O = !1,
  repositionInputs: N = !0,
  onAnimationEnd: _,
  container: k,
  autoFocus: U = !1,
}) {
  var S, Y;
  const [H = !1, X] = Un({
      defaultProp: A,
      prop: e,
      onChange: (x) => {
        (t?.(x),
          !x && !C && rr(),
          setTimeout(() => {
            _?.(x);
          }, j.DURATION * 1e3),
          x &&
            !b &&
            typeof window < "u" &&
            window.requestAnimationFrame(() => {
              document.body.style.pointerEvents = "auto";
            }),
          x || (document.body.style.pointerEvents = "auto"));
      },
    }),
    [B, J] = w.useState(!1),
    [ne, we] = w.useState(!1),
    [Zn, Et] = w.useState(!1),
    de = w.useRef(null),
    Te = w.useRef(null),
    Ve = w.useRef(null),
    Ye = w.useRef(null),
    ye = w.useRef(null),
    be = w.useRef(!1),
    Xe = w.useRef(null),
    Ke = w.useRef(0),
    fe = w.useRef(!1),
    xt = w.useRef(!A),
    St = w.useRef(0),
    D = w.useRef(null),
    Ct = w.useRef(((S = D.current) == null ? void 0 : S.getBoundingClientRect().height) || 0),
    Rt = w.useRef(((Y = D.current) == null ? void 0 : Y.getBoundingClientRect().width) || 0),
    qe = w.useRef(0),
    Qn = w.useCallback((x) => {
      a && x === Ee.length - 1 && (Te.current = new Date());
    }, []),
    {
      activeSnapPoint: Jn,
      activeSnapPointIndex: me,
      setActiveSnapPoint: Dt,
      onRelease: er,
      snapPointsOffset: Ee,
      onDrag: tr,
      shouldFade: Nt,
      getPercentageDragged: nr,
    } = ja({
      snapPoints: a,
      activeSnapPointProp: E,
      setActiveSnapPointProp: T,
      drawerRef: D,
      fadeFromIndex: v,
      overlayRef: de,
      onSnapPointChange: Qn,
      direction: y,
      container: k,
      snapToSequentialPoint: h,
    });
  Sa({ isDisabled: !H || ne || !b || Zn || !B || !N || !F });
  const { restorePositionSetting: rr } = La({
    isOpen: H,
    modal: b,
    nested: C ?? !1,
    hasBeenOpened: B,
    preventScrollRestoration: O,
    noBodyStyles: R,
  });
  function Oe() {
    return (window.innerWidth - ft) / window.innerWidth;
  }
  function or(x) {
    var M, I;
    (!f && !a) ||
      (D.current && !D.current.contains(x.target)) ||
      ((Ct.current = ((M = D.current) == null ? void 0 : M.getBoundingClientRect().height) || 0),
      (Rt.current = ((I = D.current) == null ? void 0 : I.getBoundingClientRect().width) || 0),
      we(!0),
      (Ve.current = new Date()),
      _n() && window.addEventListener("touchend", () => (be.current = !1), { once: !0 }),
      x.target.setPointerCapture(x.pointerId),
      (Ke.current = $(y) ? x.pageY : x.pageX));
  }
  function Tt(x, M) {
    var I;
    let P = x;
    const L = (I = window.getSelection()) == null ? void 0 : I.toString(),
      V = D.current ? $e(D.current, y) : null,
      z = new Date();
    if (
      P.tagName === "SELECT" ||
      P.hasAttribute("data-vaul-no-drag") ||
      P.closest("[data-vaul-no-drag]")
    )
      return !1;
    if (y === "right" || y === "left") return !0;
    if (Te.current && z.getTime() - Te.current.getTime() < 500) return !1;
    if (V !== null && (y === "bottom" ? V > 0 : V < 0)) return !0;
    if (L && L.length > 0) return !1;
    if ((ye.current && z.getTime() - ye.current.getTime() < u && V === 0) || M)
      return ((ye.current = z), !1);
    for (; P; ) {
      if (P.scrollHeight > P.clientHeight) {
        if (P.scrollTop !== 0) return ((ye.current = new Date()), !1);
        if (P.getAttribute("role") === "dialog") return !0;
      }
      P = P.parentNode;
    }
    return !0;
  }
  function ar(x) {
    if (D.current && ne) {
      const M = y === "bottom" || y === "right" ? 1 : -1,
        I = (Ke.current - ($(y) ? x.pageY : x.pageX)) * M,
        P = I > 0,
        L = a && !f && !P;
      if (L && me === 0) return;
      const V = Math.abs(I),
        z = document.querySelector("[data-vaul-drawer-wrapper]"),
        re = y === "bottom" || y === "top" ? Ct.current : Rt.current;
      let K = V / re;
      const se = nr(V, P);
      if ((se !== null && (K = se), (L && K >= 1) || (!be.current && !Tt(x.target, P)))) return;
      if (
        (D.current.classList.add(lt),
        (be.current = !0),
        W(D.current, { transition: "none" }),
        W(de.current, { transition: "none" }),
        a && tr({ draggedDistance: I }),
        P && !a)
      ) {
        const G = Oa(I),
          Pe = Math.min(G * -1, 0) * M;
        W(D.current, {
          transform: $(y) ? `translate3d(0, ${Pe}px, 0)` : `translate3d(${Pe}px, 0, 0)`,
        });
        return;
      }
      const oe = 1 - K;
      if (
        ((Nt || (v && me === v - 1)) &&
          (r?.(x, K), W(de.current, { opacity: `${oe}`, transition: "none" }, !0)),
        z && de.current && l)
      ) {
        const G = Math.min(Oe() + K * (1 - Oe()), 1),
          Pe = 8 - K * 8,
          Pt = Math.max(0, 14 - K * 14);
        W(
          z,
          {
            borderRadius: `${Pe}px`,
            transform: $(y)
              ? `scale(${G}) translate3d(0, ${Pt}px, 0)`
              : `scale(${G}) translate3d(${Pt}px, 0, 0)`,
            transition: "none",
          },
          !0,
        );
      }
      if (!a) {
        const G = V * M;
        W(D.current, {
          transform: $(y) ? `translate3d(0, ${G}px, 0)` : `translate3d(${G}px, 0, 0)`,
        });
      }
    }
  }
  (w.useEffect(() => {
    window.requestAnimationFrame(() => {
      xt.current = !0;
    });
  }, []),
    w.useEffect(() => {
      var x;
      function M() {
        if (!D.current || !N) return;
        const I = document.activeElement;
        if (dt(I) || fe.current) {
          var P;
          const L = ((P = window.visualViewport) == null ? void 0 : P.height) || 0,
            V = window.innerHeight;
          let z = V - L;
          const re = D.current.getBoundingClientRect().height || 0,
            K = re > V * 0.8;
          qe.current || (qe.current = re);
          const se = D.current.getBoundingClientRect().top;
          if (
            (Math.abs(St.current - z) > 60 && (fe.current = !fe.current),
            a && a.length > 0 && Ee && me)
          ) {
            const oe = Ee[me] || 0;
            z += oe;
          }
          if (((St.current = z), re > L || fe.current)) {
            const oe = D.current.getBoundingClientRect().height;
            let G = oe;
            (oe > L && (G = L - (K ? se : ft)),
              m
                ? (D.current.style.height = `${oe - Math.max(z, 0)}px`)
                : (D.current.style.height = `${Math.max(G, L - se)}px`));
          } else ha() || (D.current.style.height = `${qe.current}px`);
          a && a.length > 0 && !fe.current
            ? (D.current.style.bottom = "0px")
            : (D.current.style.bottom = `${Math.max(z, 0)}px`);
        }
      }
      return (
        (x = window.visualViewport) == null || x.addEventListener("resize", M),
        () => {
          var I;
          return (I = window.visualViewport) == null ? void 0 : I.removeEventListener("resize", M);
        }
      );
    }, [me, a, Ee]));
  function xe(x) {
    (ir(),
      g?.(),
      x || X(!1),
      setTimeout(() => {
        a && Dt(a[0]);
      }, j.DURATION * 1e3));
  }
  function Ot() {
    if (!D.current) return;
    const x = document.querySelector("[data-vaul-drawer-wrapper]"),
      M = $e(D.current, y);
    (W(D.current, {
      transform: "translate3d(0, 0, 0)",
      transition: `transform ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
    }),
      W(de.current, {
        transition: `opacity ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
        opacity: "1",
      }),
      l &&
        M &&
        M > 0 &&
        H &&
        W(
          x,
          {
            borderRadius: `${Wn}px`,
            overflow: "hidden",
            ...($(y)
              ? {
                  transform: `scale(${Oe()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`,
                  transformOrigin: "top",
                }
              : {
                  transform: `scale(${Oe()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
                  transformOrigin: "left",
                }),
            transitionProperty: "transform, border-radius",
            transitionDuration: `${j.DURATION}s`,
            transitionTimingFunction: `cubic-bezier(${j.EASE.join(",")})`,
          },
          !0,
        ));
  }
  function ir() {
    !ne ||
      !D.current ||
      (D.current.classList.remove(lt), (be.current = !1), we(!1), (Ye.current = new Date()));
  }
  function sr(x) {
    if (!ne || !D.current) return;
    (D.current.classList.remove(lt), (be.current = !1), we(!1), (Ye.current = new Date()));
    const M = $e(D.current, y);
    if (!x || !Tt(x.target, !1) || !M || Number.isNaN(M) || Ve.current === null) return;
    const I = Ye.current.getTime() - Ve.current.getTime(),
      P = Ke.current - ($(y) ? x.pageY : x.pageX),
      L = Math.abs(P) / I;
    if (
      (L > 0.05 &&
        (Et(!0),
        setTimeout(() => {
          Et(!1);
        }, 200)),
      a)
    ) {
      (er({
        draggedDistance: P * (y === "bottom" || y === "right" ? 1 : -1),
        closeDrawer: xe,
        velocity: L,
        dismissible: f,
      }),
        o?.(x, !0));
      return;
    }
    if (y === "bottom" || y === "right" ? P > 0 : P < 0) {
      (Ot(), o?.(x, !0));
      return;
    }
    if (L > Fn) {
      (xe(), o?.(x, !1));
      return;
    }
    var V;
    const z = Math.min(
      (V = D.current.getBoundingClientRect().height) != null ? V : 0,
      window.innerHeight,
    );
    var re;
    const K = Math.min(
        (re = D.current.getBoundingClientRect().width) != null ? re : 0,
        window.innerWidth,
      ),
      se = y === "left" || y === "right";
    if (Math.abs(M) >= (se ? K : z) * p) {
      (xe(), o?.(x, !1));
      return;
    }
    (o?.(x, !0), Ot());
  }
  w.useEffect(
    () => (
      H && (W(document.documentElement, { scrollBehavior: "auto" }), (Te.current = new Date())),
      () => {
        Ta(document.documentElement, "scrollBehavior");
      }
    ),
    [H],
  );
  function lr(x) {
    const M = x ? (window.innerWidth - le) / window.innerWidth : 1,
      I = x ? -le : 0;
    (Xe.current && window.clearTimeout(Xe.current),
      W(D.current, {
        transition: `transform ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
        transform: $(y)
          ? `scale(${M}) translate3d(0, ${I}px, 0)`
          : `scale(${M}) translate3d(${I}px, 0, 0)`,
      }),
      !x &&
        D.current &&
        (Xe.current = setTimeout(() => {
          const P = $e(D.current, y);
          W(D.current, {
            transition: "none",
            transform: $(y) ? `translate3d(0, ${P}px, 0)` : `translate3d(${P}px, 0, 0)`,
          });
        }, 500)));
  }
  function cr(x, M) {
    if (M < 0) return;
    const I = (window.innerWidth - le) / window.innerWidth,
      P = I + M * (1 - I),
      L = -le + M * le;
    W(D.current, {
      transform: $(y)
        ? `scale(${P}) translate3d(0, ${L}px, 0)`
        : `scale(${P}) translate3d(${L}px, 0, 0)`,
      transition: "none",
    });
  }
  function ur(x, M) {
    const I = $(y) ? window.innerHeight : window.innerWidth,
      P = M ? (I - le) / I : 1,
      L = M ? -le : 0;
    M &&
      W(D.current, {
        transition: `transform ${j.DURATION}s cubic-bezier(${j.EASE.join(",")})`,
        transform: $(y)
          ? `scale(${P}) translate3d(0, ${L}px, 0)`
          : `scale(${P}) translate3d(${L}px, 0, 0)`,
      });
  }
  return (
    w.useEffect(() => {
      b ||
        window.requestAnimationFrame(() => {
          document.body.style.pointerEvents = "auto";
        });
    }, [b]),
    w.createElement(
      Nn,
      {
        defaultOpen: A,
        onOpenChange: (x) => {
          (!f && !x) || (x ? J(!0) : xe(!0), X(x));
        },
        open: H,
      },
      w.createElement(
        jn.Provider,
        {
          value: {
            activeSnapPoint: Jn,
            snapPoints: a,
            setActiveSnapPoint: Dt,
            drawerRef: D,
            overlayRef: de,
            onOpenChange: t,
            onPress: or,
            onRelease: sr,
            onDrag: ar,
            dismissible: f,
            shouldAnimate: xt,
            handleOnly: d,
            isOpen: H,
            isDragging: ne,
            shouldFade: Nt,
            closeDrawer: xe,
            onNestedDrag: cr,
            onNestedOpenChange: lr,
            onNestedRelease: ur,
            keyboardIsOpen: fe,
            modal: b,
            snapPointsOffset: Ee,
            activeSnapPointIndex: me,
            direction: y,
            shouldScaleBackground: l,
            setBackgroundColorOnScale: i,
            noBodyStyles: R,
            container: k,
            autoFocus: U,
          },
        },
        n,
      ),
    )
  );
}
const Hn = w.forwardRef(function ({ ...e }, t) {
  const {
      overlayRef: n,
      snapPoints: r,
      onRelease: o,
      shouldFade: a,
      isOpen: l,
      modal: i,
      shouldAnimate: p,
    } = Ne(),
    u = Ln(t, n),
    f = r && r.length > 0;
  if (!i) return null;
  const d = w.useCallback((v) => o(v), [o]);
  return w.createElement(ht, {
    onMouseUp: d,
    ref: u,
    "data-vaul-overlay": "",
    "data-vaul-snap-points": l && f ? "true" : "false",
    "data-vaul-snap-points-overlay": l && a ? "true" : "false",
    "data-vaul-animate": p?.current ? "true" : "false",
    ...e,
  });
});
Hn.displayName = "Drawer.Overlay";
const zn = w.forwardRef(function (
  { onPointerDownOutside: e, style: t, onOpenAutoFocus: n, ...r },
  o,
) {
  const {
      drawerRef: a,
      onPress: l,
      onRelease: i,
      onDrag: p,
      keyboardIsOpen: u,
      snapPointsOffset: f,
      activeSnapPointIndex: d,
      modal: v,
      isOpen: E,
      direction: T,
      snapPoints: m,
      container: b,
      handleOnly: g,
      shouldAnimate: C,
      autoFocus: R,
    } = Ne(),
    [y, A] = w.useState(!1),
    F = Ln(o, a),
    h = w.useRef(null),
    O = w.useRef(null),
    N = w.useRef(!1),
    _ = m && m.length > 0;
  ka();
  const k = (S, Y, H = 0) => {
    if (N.current) return !0;
    const X = Math.abs(S.y),
      B = Math.abs(S.x),
      J = B > X,
      ne = ["bottom", "right"].includes(Y) ? 1 : -1;
    if (Y === "left" || Y === "right") {
      if (!(S.x * ne < 0) && B >= 0 && B <= H) return J;
    } else if (!(S.y * ne < 0) && X >= 0 && X <= H) return !J;
    return ((N.current = !0), !0);
  };
  w.useEffect(() => {
    _ &&
      window.requestAnimationFrame(() => {
        A(!0);
      });
  }, []);
  function U(S) {
    ((h.current = null), (N.current = !1), i(S));
  }
  return w.createElement(gt, {
    "data-vaul-drawer-direction": T,
    "data-vaul-drawer": "",
    "data-vaul-delayed-snap-points": y ? "true" : "false",
    "data-vaul-snap-points": E && _ ? "true" : "false",
    "data-vaul-custom-container": b ? "true" : "false",
    "data-vaul-animate": C?.current ? "true" : "false",
    ...r,
    ref: F,
    style: f && f.length > 0 ? { "--snap-point-height": `${f[d ?? 0]}px`, ...t } : t,
    onPointerDown: (S) => {
      g ||
        (r.onPointerDown == null || r.onPointerDown.call(r, S),
        (h.current = { x: S.pageX, y: S.pageY }),
        l(S));
    },
    onOpenAutoFocus: (S) => {
      (n?.(S), R || S.preventDefault());
    },
    onPointerDownOutside: (S) => {
      if ((e?.(S), !v || S.defaultPrevented)) {
        S.preventDefault();
        return;
      }
      u.current && (u.current = !1);
    },
    onFocusOutside: (S) => {
      if (!v) {
        S.preventDefault();
        return;
      }
    },
    onPointerMove: (S) => {
      if (
        ((O.current = S), g || (r.onPointerMove == null || r.onPointerMove.call(r, S), !h.current))
      )
        return;
      const Y = S.pageY - h.current.y,
        H = S.pageX - h.current.x,
        X = S.pointerType === "touch" ? 10 : 2;
      k({ x: H, y: Y }, T, X) ? p(S) : (Math.abs(H) > X || Math.abs(Y) > X) && (h.current = null);
    },
    onPointerUp: (S) => {
      (r.onPointerUp == null || r.onPointerUp.call(r, S),
        (h.current = null),
        (N.current = !1),
        i(S));
    },
    onPointerOut: (S) => {
      (r.onPointerOut == null || r.onPointerOut.call(r, S), U(O.current));
    },
    onContextMenu: (S) => {
      (r.onContextMenu == null || r.onContextMenu.call(r, S), O.current && U(O.current));
    },
  });
});
zn.displayName = "Drawer.Content";
const Fa = 250,
  Wa = 120,
  Ba = w.forwardRef(function ({ preventCycle: e = !1, children: t, ...n }, r) {
    const {
        closeDrawer: o,
        isDragging: a,
        snapPoints: l,
        activeSnapPoint: i,
        setActiveSnapPoint: p,
        dismissible: u,
        handleOnly: f,
        isOpen: d,
        onPress: v,
        onDrag: E,
      } = Ne(),
      T = w.useRef(null),
      m = w.useRef(!1);
    function b() {
      if (m.current) {
        R();
        return;
      }
      window.setTimeout(() => {
        g();
      }, Wa);
    }
    function g() {
      if (a || e || m.current) {
        R();
        return;
      }
      if ((R(), !l || l.length === 0)) {
        u || o();
        return;
      }
      if (i === l[l.length - 1] && u) {
        o();
        return;
      }
      const A = l.findIndex((h) => h === i);
      if (A === -1) return;
      const F = l[A + 1];
      p(F);
    }
    function C() {
      T.current = window.setTimeout(() => {
        m.current = !0;
      }, Fa);
    }
    function R() {
      (T.current && window.clearTimeout(T.current), (m.current = !1));
    }
    return w.createElement(
      "div",
      {
        onClick: b,
        onPointerCancel: R,
        onPointerDown: (y) => {
          (f && v(y), C());
        },
        onPointerMove: (y) => {
          f && E(y);
        },
        ref: r,
        "data-vaul-drawer-visible": d ? "true" : "false",
        "data-vaul-handle": "",
        "aria-hidden": "true",
        ...n,
      },
      w.createElement("span", { "data-vaul-handle-hitarea": "", "aria-hidden": "true" }, t),
    );
  });
Ba.displayName = "Drawer.Handle";
function Ua(e) {
  const t = Ne(),
    { container: n = t.container, ...r } = e;
  return w.createElement(Tn, { container: n, ...r });
}
const te = { Root: $a, Content: zn, Overlay: Hn, Portal: Ua, Title: wt, Description: yt },
  Vn = ({ shouldScaleBackground: e = !0, ...t }) =>
    c.jsx(te.Root, { shouldScaleBackground: e, ...t });
Vn.displayName = "Drawer";
const Ha = te.Portal,
  Yn = s.forwardRef(({ className: e, ...t }, n) =>
    c.jsx(te.Overlay, { ref: n, className: Q("fixed inset-0 z-50 bg-black/80", e), ...t }),
  );
Yn.displayName = te.Overlay.displayName;
const Xn = s.forwardRef(({ className: e, children: t, ...n }, r) =>
  c.jsxs(Ha, {
    children: [
      c.jsx(Yn, {}),
      c.jsxs(te.Content, {
        ref: r,
        className: Q(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          e,
        ),
        ...n,
        children: [
          c.jsx("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }),
          t,
        ],
      }),
    ],
  }),
);
Xn.displayName = "DrawerContent";
const Kn = ({ className: e, ...t }) =>
  c.jsx("div", { className: Q("grid gap-1.5 p-4 text-center sm:text-left", e), ...t });
Kn.displayName = "DrawerHeader";
const qn = s.forwardRef(({ className: e, ...t }, n) =>
  c.jsx(te.Title, {
    ref: n,
    className: Q("text-lg font-semibold leading-none tracking-tight", e),
    ...t,
  }),
);
qn.displayName = te.Title.displayName;
const Gn = s.forwardRef(({ className: e, ...t }, n) =>
  c.jsx(te.Description, { ref: n, className: Q("text-sm text-muted-foreground", e), ...t }),
);
Gn.displayName = te.Description.displayName;
function Ja() {
  mr();
  const [e, t] = s.useState(null),
    n = Rr(),
    r = (l) => {
      t(l);
    },
    o = () => {
      t(null);
    },
    a = ({ org: l }) =>
      c.jsxs("div", {
        className: "flex flex-col items-center pt-4 pb-6 px-4",
        children: [
          c.jsx("div", {
            className:
              "h-24 w-24 rounded-full overflow-hidden border border-border/40 shadow-sm mb-4 relative",
            children: c.jsx("img", {
              src: l.avatar,
              alt: l.name,
              className: "w-full h-full object-cover",
            }),
          }),
          c.jsxs("div", {
            className: "flex items-center gap-1.5 mb-1",
            children: [
              c.jsx("h2", { className: "text-xl font-bold", children: l.name }),
              c.jsx(br, { className: "h-5 w-5 text-primary fill-primary/20" }),
            ],
          }),
          c.jsxs("p", {
            className: "text-sm font-medium text-muted-foreground mb-4",
            children: ["@", l.handle, " • ", (l.followers / 1e3).toFixed(1), "k followers"],
          }),
          c.jsx("p", { className: "text-center text-sm mb-6 max-w-xs", children: l.bio }),
          c.jsxs("div", {
            className: "flex gap-4 w-full justify-center mb-6",
            children: [
              c.jsx(Ae, {
                variant: "outline",
                size: "icon",
                className: "rounded-full",
                asChild: !0,
                children: c.jsx("a", {
                  href: l.twitterUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: c.jsx(Cr, { className: "h-4 w-4" }),
                }),
              }),
              c.jsx(Ae, {
                variant: "outline",
                size: "icon",
                className: "rounded-full",
                asChild: !0,
                children: c.jsx("a", {
                  href: l.instagramUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: c.jsx(xr, { className: "h-4 w-4" }),
                }),
              }),
            ],
          }),
          c.jsx(Ae, {
            className: "w-full max-w-xs rounded-full font-bold shadow-[var(--shadow-glow)]",
            style: { background: "var(--gradient-primary)" },
            children: "Follow",
          }),
        ],
      });
  return c.jsxs("div", {
    className:
      "min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none",
    children: [
      c.jsx("div", { className: "hidden md:block", children: c.jsx(vr, {}) }),
      c.jsx("div", {
        className:
          "md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-2",
        children: c.jsxs("div", {
          className: "relative flex-1",
          children: [
            c.jsx(gr, {
              className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            }),
            c.jsx(wr, {
              placeholder: "Search organizers...",
              className: "pl-9 rounded-full bg-secondary/60 border-transparent text-sm h-10",
            }),
          ],
        }),
      }),
      c.jsxs("div", {
        className: "mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10",
        children: [
          c.jsx("header", {
            className: "hidden md:flex flex-wrap items-end justify-between gap-4 mb-8",
            children: c.jsxs("div", {
              children: [
                c.jsx("h1", {
                  className: "text-3xl font-semibold tracking-tight",
                  children: "Popular Organizers",
                }),
                c.jsx("p", {
                  className: "mt-1 text-sm text-muted-foreground",
                  children: "Discover and follow Africa's best creators and venues.",
                }),
              ],
            }),
          }),
          c.jsx("div", {
            className: "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5",
            children: pr.map((l) =>
              c.jsxs(
                "div",
                {
                  onClick: () => r(l),
                  className:
                    "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center",
                  children: [
                    c.jsx("div", {
                      className:
                        "relative h-20 w-20 mb-3 rounded-full overflow-hidden border border-border/40",
                      children: c.jsx("img", {
                        src: l.avatar,
                        alt: l.name,
                        className: "w-full h-full object-cover",
                      }),
                    }),
                    c.jsx("h3", {
                      className: "font-semibold text-sm leading-tight line-clamp-1 w-full",
                      children: l.name,
                    }),
                    c.jsxs("p", {
                      className: "text-xs text-muted-foreground mt-1",
                      children: [(l.followers / 1e3).toFixed(1), "k followers"],
                    }),
                    c.jsx(Ae, {
                      className:
                        "w-full mt-4 rounded-full text-xs font-semibold h-8 shadow-[var(--shadow-glow)]",
                      style: { background: "var(--gradient-primary)" },
                      onClick: (i) => {
                        i.stopPropagation();
                      },
                      children: "Follow",
                    }),
                  ],
                },
                l.id,
              ),
            ),
          }),
        ],
      }),
      c.jsx("div", { className: "hidden md:block", children: c.jsx(hr, {}) }),
      n
        ? c.jsx(Vn, {
            open: !!e,
            onOpenChange: (l) => !l && o(),
            children: c.jsxs(Xn, {
              children: [
                c.jsxs(Kn, {
                  className: "sr-only",
                  children: [
                    c.jsx(qn, { children: e?.name }),
                    c.jsxs(Gn, { children: ["Profile details for ", e?.name] }),
                  ],
                }),
                e && c.jsx(a, { org: e }),
              ],
            }),
          })
        : c.jsx(ma, {
            open: !!e,
            onOpenChange: (l) => !l && o(),
            children: c.jsxs(Pn, {
              className: "sm:max-w-md rounded-3xl",
              children: [
                c.jsxs(An, {
                  className: "sr-only",
                  children: [
                    c.jsx(Mn, { children: e?.name }),
                    c.jsxs(In, { children: ["Profile details for ", e?.name] }),
                  ],
                }),
                e && c.jsx(a, { org: e }),
              ],
            }),
          }),
    ],
  });
}
export { Ja as component };
