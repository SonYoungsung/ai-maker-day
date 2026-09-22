import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AppId = "home" | "materials" | "submit" | "dashboard" | "help";

// 창 기본 크기/위치 오프셋 (컴포넌트는 apps.tsx 가 매핑 — 순환참조 방지).
export const APP_META: Record<AppId, { title: string; w: number; h: number; off: [number, number] }> = {
  home: { title: "홈 — AI 메이커데이", w: 720, h: 600, off: [0, 0] },
  materials: { title: "강의 자료", w: 720, h: 580, off: [-46, 22] },
  submit: { title: "결과 제출", w: 700, h: 640, off: [40, 40] },
  dashboard: { title: "강사 대시보드", w: 900, h: 580, off: [24, -6] },
  help: { title: "읽어보기", w: 480, h: 460, off: [60, 30] },
};

// Dock 에 노출되는 앱 순서
export const DOCK_APPS: AppId[] = ["home", "materials", "submit", "dashboard"];

export interface WinState {
  id: AppId;
  x: number; y: number; w: number; h: number;
  z: number;
  min: boolean;
  max: boolean;
  prev?: { x: number; y: number; w: number; h: number };
}

interface Ctx {
  windows: WinState[];
  booted: boolean;
  enterDesktop: () => void;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  toggleMax: (id: AppId) => void;
  setRect: (id: AppId, rect: { x: number; y: number; w: number; h: number }) => void;
}

const WindowsContext = createContext<Ctx | null>(null);
export const useWindows = () => {
  const c = useContext(WindowsContext);
  if (!c) throw new Error("useWindows must be used within WindowsProvider");
  return c;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));

export function WindowsProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WinState[]>([]);
  const [booted, setBooted] = useState(false);
  const zRef = useRef(20);
  const nextZ = () => (zRef.current += 1);

  const focusApp = useCallback((id: AppId) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z: nextZ() } : w)));
  }, []);

  const openApp = useCallback((id: AppId) => {
    setWindows((ws) => {
      const existing = ws.find((w) => w.id === id);
      if (existing) {
        return ws.map((w) => (w.id === id ? { ...w, min: false, z: nextZ() } : w));
      }
      const meta = APP_META[id];
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = Math.min(meta.w, vw - 40);
      const h = Math.min(meta.h, vh - 130);
      const x = clamp(Math.round((vw - w) / 2 + meta.off[0]), 12, Math.max(12, vw - w - 12));
      const y = clamp(Math.round(60 + meta.off[1]), 38, Math.max(38, vh - h - 96));
      return [...ws, { id, x, y, w, h, z: nextZ(), min: false, max: false }];
    });
  }, []);

  const closeApp = useCallback((id: AppId) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const minimizeApp = useCallback((id: AppId) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)));
  }, []);

  const toggleMax = useCallback((id: AppId) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        if (w.max && w.prev) {
          return { ...w, ...w.prev, max: false, prev: undefined, z: nextZ() };
        }
        const vw = window.innerWidth, vh = window.innerHeight;
        return {
          ...w, max: true, z: nextZ(),
          prev: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 12, y: 38, w: vw - 24, h: vh - 38 - 84,
        };
      })
    );
  }, []);

  const setRect = useCallback((id: AppId, rect: { x: number; y: number; w: number; h: number }) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...rect, max: false } : w)));
  }, []);

  const enterDesktop = useCallback(() => {
    setBooted(true);
    // 데스크톱 진입 시 홈 창 자동 오픈
    setTimeout(() => openApp("home"), 350);
  }, [openApp]);

  return (
    <WindowsContext.Provider
      value={{ windows, booted, enterDesktop, openApp, closeApp, focusApp, minimizeApp, toggleMax, setRect }}
    >
      {children}
    </WindowsContext.Provider>
  );
}

// 페이지 내부에서 창을 여는 인라인 링크 (react-router Link 대체)
export function AppLink({
  app, children, className,
}: { app: AppId; children: ReactNode; className?: string }) {
  const { openApp } = useWindows();
  return (
    <a className={className} style={{ cursor: "pointer" }} onClick={() => openApp(app)}>
      {children}
    </a>
  );
}
