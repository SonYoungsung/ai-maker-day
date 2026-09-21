import { useRef } from "react";
import { useWindows, type WinState } from "./windows";
import { APP_COMPONENTS } from "./apps";
import { APP_META } from "./windows";

const MINW = 340, MINH = 240;
const DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;

export default function Window({ win, active }: { win: WinState; active: boolean }) {
  const { focusApp, closeApp, minimizeApp, toggleMax, setRect } = useWindows();
  const ref = useRef<HTMLDivElement>(null);
  const Comp = APP_COMPONENTS[win.id];

  // ---- 드래그 (타이틀바) ----
  const drag = useRef<{ sx: number; sy: number; l: number; t: number } | null>(null);
  function onTitleDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest(".traffic")) return;
    focusApp(win.id);
    drag.current = { sx: e.clientX, sy: e.clientY, l: win.x, t: win.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onTitleMove(e: React.PointerEvent) {
    const d = drag.current, el = ref.current;
    if (!d || !el) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const nl = Math.max(-(el.offsetWidth - 120), Math.min(d.l + (e.clientX - d.sx), vw - 120));
    const nt = Math.max(32, Math.min(d.t + (e.clientY - d.sy), vh - 100));
    el.style.left = nl + "px";
    el.style.top = nt + "px";
  }
  function onTitleUp(e: React.PointerEvent) {
    const el = ref.current;
    if (drag.current && el) {
      setRect(win.id, { x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: win.w, h: win.h });
    }
    drag.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }

  // ---- 리사이즈 (8방향) ----
  const rz = useRef<{ dir: string; sx: number; sy: number; l: number; t: number; w: number; h: number } | null>(null);
  function onHandleDown(dir: string) {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      focusApp(win.id);
      rz.current = { dir, sx: e.clientX, sy: e.clientY, l: win.x, t: win.y, w: win.w, h: win.h };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
  }
  function onHandleMove(e: React.PointerEvent) {
    const s = rz.current, el = ref.current;
    if (!s || !el) return;
    const dx = e.clientX - s.sx, dy = e.clientY - s.sy;
    let l = s.l, t = s.t, w = s.w, h = s.h;
    if (s.dir.includes("e")) w = s.w + dx;
    if (s.dir.includes("s")) h = s.h + dy;
    if (s.dir.includes("w")) { w = s.w - dx; l = s.l + dx; }
    if (s.dir.includes("n")) { h = s.h - dy; t = s.t + dy; }
    if (w < MINW) { if (s.dir.includes("w")) l = s.l + (s.w - MINW); w = MINW; }
    if (h < MINH) { if (s.dir.includes("n")) t = s.t + (s.h - MINH); h = MINH; }
    if (t < 32) { h -= 32 - t; t = 32; }
    if (l < 4) { w -= 4 - l; l = 4; }
    const vw = window.innerWidth, vh = window.innerHeight;
    if (h > vh - 84 - t) h = vh - 84 - t;
    if (w > vw - 8 - l) w = vw - 8 - l;
    el.style.left = l + "px"; el.style.top = t + "px";
    el.style.width = w + "px"; el.style.height = h + "px";
  }
  function onHandleUp(e: React.PointerEvent) {
    const el = ref.current;
    if (rz.current && el) {
      setRect(win.id, {
        x: parseFloat(el.style.left), y: parseFloat(el.style.top),
        w: parseFloat(el.style.width), h: parseFloat(el.style.height),
      });
    }
    rz.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }

  return (
    <div
      ref={ref}
      className={`os-window${active ? " active" : ""}`}
      style={{
        left: win.x, top: win.y, width: win.w, height: win.h,
        zIndex: win.z, display: win.min ? "none" : undefined,
      }}
      onPointerDown={() => focusApp(win.id)}
    >
      <div
        className="os-titlebar"
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={onTitleUp}
        onDoubleClick={() => toggleMax(win.id)}
      >
        <div className="traffic">
          <i className="r" onClick={(e) => { e.stopPropagation(); closeApp(win.id); }} />
          <i className="y" onClick={(e) => { e.stopPropagation(); minimizeApp(win.id); }} />
          <i className="g" onClick={(e) => { e.stopPropagation(); toggleMax(win.id); }} />
        </div>
        <div className="win-title">{APP_META[win.id].title}</div>
      </div>

      <div className="os-winbody thin-scroll">
        <Comp />
      </div>

      {DIRS.map((dir) => (
        <div
          key={dir}
          className={`resize-handle rh-${dir}`}
          onPointerDown={onHandleDown(dir)}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
        />
      ))}
    </div>
  );
}
