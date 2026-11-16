import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/special-elite/400.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/800.css";
import { SkeletonApp } from "@campus/skeleton";
import "./skin.css";
import { config } from "./app.config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkeletonApp config={config} />
  </StrictMode>,
);
