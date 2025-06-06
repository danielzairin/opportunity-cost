import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { OptionsPage } from "./components/options-page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OptionsPage />
  </StrictMode>
);
