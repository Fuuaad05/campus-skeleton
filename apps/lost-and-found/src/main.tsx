import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SkeletonApp } from "@campus/skeleton";
import { config } from "./app.config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkeletonApp config={config} />
  </StrictMode>,
);
