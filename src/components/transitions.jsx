/**
 * Daye — Page Transitions
 *
 * Router-agnostic. Works with React Router, Wouter, or any setup.
 *
 * Usage:
 *   1. Wrap your app root in <PageTransitionProvider>
 *   2. Wrap each page component in <PageTransition>
 *   3. Use the useNavigate hook from this file instead of your router's
 *      navigate — it triggers the exit animation before route change.
 *
 * Works alongside React Router:
 *   import { useNavigate as useRouterNav } from "react-router-dom";
 *   const navigate = usePageNavigate(); // from this file — handles animation
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

// ─── Context ────────────────────────────────────────────────────
const TransitionCtx = createContext({
  state: "entered",
  navigateTo: () => {},
});

// ─── CSS ────────────────────────────────────────────────────────
const transitionCSS = `
  .page-transition-wrap {
    will-change: opacity, transform;
  }

  /* entering */
  @keyframes pageEnter {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0px);
    }
  }

  /* exiting */
  @keyframes pageExit {
    from {
      opacity: 1;
      transform: translateY(0px);
    }
    to {
      opacity: 0;
      transform: translateY(-8px);
    }
  }

  .page-transition-wrap[data-state="entering"] {
    animation: pageEnter 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .page-transition-wrap[data-state="exiting"] {
    animation: pageExit 0.28s cubic-bezier(0.4, 0, 1, 1) forwards;
    pointer-events: none;
  }

  .page-transition-wrap[data-state="entered"] {
    opacity: 1;
  }

  /* Subtle nav link underline sweep */
  .nav-link-animated {
    position: relative;
    text-decoration: none;
  }
  .nav-link-animated::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    width: 0; height: 1px;
    background: currentColor;
    transition: width 0.25s ease;
  }
  .nav-link-animated:hover::after { width: 100%; }

  /* Progress bar at top of page on navigate */
  .page-progress-bar {
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(to right, #C5BFD4, #B8C4B1);
    z-index: 9999;
    pointer-events: none;
    transform-origin: left;
    transition: width 0.3s ease;
  }
`;

// ─── Provider ───────────────────────────────────────────────────
export function PageTransitionProvider({ children, navigate: routerNavigate }) {
  const [state, setState] = useState("entered");
  const [progress, setProgress] = useState(0);
  const pendingRef = useRef(null);

  // Inject CSS once
  useEffect(() => {
    const id = "daye-transitions";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = transitionCSS;
      document.head.appendChild(tag);
    }
  }, []);

  const navigateTo = useCallback(
    (path) => {
      // Start progress bar
      setProgress(60);
      setState("exiting");
      pendingRef.current = path;

      setTimeout(() => {
        setProgress(90);
        // Trigger the actual route change
        if (routerNavigate) {
          routerNavigate(path);
        } else {
          window.location.href = path;
        }
        setState("entering");
        setProgress(100);

        setTimeout(() => {
          setState("entered");
          setProgress(0);
        }, 450);
      }, 280);
    },
    [routerNavigate]
  );

  return (
    <TransitionCtx.Provider value={{ state, navigateTo }}>
      {/* Progress bar */}
      {progress > 0 && (
        <div
          className="page-progress-bar"
          style={{ width: `${progress}%` }}
        />
      )}
      {children}
    </TransitionCtx.Provider>
  );
}

// ─── Page wrapper ────────────────────────────────────────────────
export function PageTransition({ children }) {
  const { state } = useContext(TransitionCtx);
  return (
    <div className="page-transition-wrap" data-state={state}>
      {children}
    </div>
  );
}

// ─── Navigate hook ───────────────────────────────────────────────
export function usePageNavigate() {
  const { navigateTo } = useContext(TransitionCtx);
  return navigateTo;
}

// ─── Animated link component ────────────────────────────────────
export function TransitionLink({ href, children, className = "", ...props }) {
  const { navigateTo } = useContext(TransitionCtx);

  const handleClick = (e) => {
    // Let external links and modifier keys through
    if (
      e.ctrlKey || e.metaKey || e.shiftKey ||
      (href && (href.startsWith("http") || href.startsWith("mailto")))
    ) {
      return;
    }
    e.preventDefault();
    navigateTo(href);
  };

  return (
    <a
      href={href}
      className={`nav-link-animated ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * ── Integration examples ─────────────────────────────────────────
 *
 * WITH REACT ROUTER:
 * ------------------
 * import { useNavigate } from "react-router-dom";
 * import { PageTransitionProvider, PageTransition } from "./transitions";
 *
 * function AppShell() {
 *   const navigate = useNavigate();
 *   return (
 *     <PageTransitionProvider navigate={navigate}>
 *       <Routes>
 *         <Route path="/" element={
 *           <PageTransition><HomePage /></PageTransition>
 *         } />
 *         <Route path="/blog" element={
 *           <PageTransition><BlogPage /></PageTransition>
 *         } />
 *         <Route path="/pro" element={
 *           <PageTransition><ProPage /></PageTransition>
 *         } />
 *       </Routes>
 *     </PageTransitionProvider>
 *   );
 * }
 *
 * WITH WOUTER:
 * ------------
 * import { useLocation } from "wouter";
 * import { PageTransitionProvider, PageTransition } from "./transitions";
 *
 * function AppShell() {
 *   const [, setLocation] = useLocation();
 *   return (
 *     <PageTransitionProvider navigate={setLocation}>
 *       <Switch>
 *         <Route path="/" component={() =>
 *           <PageTransition><HomePage /></PageTransition>
 *         } />
 *       </Switch>
 *     </PageTransitionProvider>
 *   );
 * }
 *
 * NAV LINKS:
 * ----------
 * import { TransitionLink } from "./transitions";
 * <TransitionLink href="/blog">Blog</TransitionLink>
 *
 * PROGRAMMATIC:
 * -------------
 * const navigate = usePageNavigate();
 * <button onClick={() => navigate("/pro")}>Upgrade</button>
 */
