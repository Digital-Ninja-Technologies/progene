import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Hide preloader once React has mounted AND the window 'load' event has fired
// (ensures images, fonts, and stylesheets have finished loading).
const hidePreloader = () => {
  const el = document.getElementById("preloader");
  if (!el) return;
  el.classList.add("pl-hidden");
  window.setTimeout(() => el.remove(), 500);
};

const onReady = () => {
  // Give React one frame to paint, then hide.
  requestAnimationFrame(() => requestAnimationFrame(hidePreloader));
};

if (document.readyState === "complete") {
  onReady();
} else {
  window.addEventListener("load", onReady, { once: true });
  // Safety net in case 'load' is delayed by long-tail resources.
  window.setTimeout(onReady, 4000);
}
