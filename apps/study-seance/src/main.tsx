import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/young-serif/400.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { SkeletonApp } from "@campus/skeleton";
import "./skin.css";
import { config } from "./app.config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkeletonApp config={config} />
  </StrictMode>,
);
