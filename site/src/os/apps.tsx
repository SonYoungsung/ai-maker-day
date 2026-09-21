import type { ComponentType } from "react";
import type { AppId } from "./windows";
import Home from "../pages/Home";
import Materials from "../pages/Materials";
import Submit from "../pages/Submit";
import Dashboard from "../pages/Dashboard";
import Setup from "../pages/Setup";
import Help from "./Help";

// AppId → 창 안에 렌더할 컴포넌트. (크기/제목은 windows.tsx APP_META)
export const APP_COMPONENTS: Record<AppId, ComponentType> = {
  home: Home,
  materials: Materials,
  submit: Submit,
  dashboard: Dashboard,
  setup: Setup,
  help: Help,
};

// Dock/바탕화면 아이콘용 SVG 심볼 id
export const APP_ICON: Record<AppId, string> = {
  home: "ic-home",
  materials: "ic-mat",
  submit: "ic-sub",
  dashboard: "ic-dash",
  setup: "ic-setup",
  help: "ic-doc",
};
