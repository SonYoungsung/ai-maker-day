import { useRef, useState } from "react";
import { useWindows, DOCK_APPS, APP_META, type AppId } from "./windows";
import { APP_ICON } from "./apps";
import { Icon } from "./icons";

const BASE = 56, MAX = 34, RANGE = 115;

export default function Dock() {
  const { windows, openApp } = useWindows();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [tip, setTip] = useState<string | null>(null);
  const running = new Set(windows.map((w) => w.id));

  function magnify(clientX: number) {
    for (const app of DOCK_APPS) {
      const el = itemRefs.current[app];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(clientX - c);
      const boost = d < RANGE ? Math.cos((d / RANGE) * (Math.PI / 2)) * MAX : 0;
      el.style.width = el.style.height = BASE + boost + "px";
      el.style.marginBottom = boost * 0.32 + "px";
    }
  }
  function reset() {
    for (const app of DOCK_APPS) {
      const el = itemRefs.current[app];
      if (el) { el.style.width = el.style.height = BASE + "px"; el.style.marginBottom = "0px"; }
    }
  }

  function onClick(app: AppId) {
    const el = itemRefs.current[app];
    if (el) { el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce"); }
    openApp(app);
  }

  return (
    <div className="dock-wrap">
      <div className={`dock-tip${tip ? " show" : ""}`}>{tip}</div>
      <div
        className="dock glass"
        onPointerMove={(e) => magnify(e.clientX)}
        onPointerLeave={reset}
      >
        {DOCK_APPS.map((app) => (
          <div
            key={app}
            ref={(el) => { itemRefs.current[app] = el; }}
            className={`dock-item${running.has(app) ? " running" : ""}`}
            onClick={() => onClick(app)}
            onMouseEnter={() => setTip(APP_META[app].title.split(" — ")[0])}
            onMouseLeave={() => setTip(null)}
          >
            <Icon id={APP_ICON[app]} />
          </div>
        ))}
      </div>
    </div>
  );
}
