import { useState } from "react";
import { useWindows, type AppId } from "./windows";
import { Icon } from "./icons";

const ICONS: { app: AppId; label: string; icon: string; wide?: boolean }[] = [
  { app: "materials", label: "강의 자료", icon: "ic-folder" },
  { app: "dashboard", label: "제출 현황", icon: "ic-folder" },
  { app: "help", label: "읽어보기", icon: "ic-doc", wide: false },
];

export default function DesktopIcons() {
  const { openApp } = useWindows();
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="desktop-icons">
      {ICONS.map((it) => (
        <div
          key={it.app}
          className={`desktop-icon${sel === it.app ? " selected" : ""}`}
          onClick={(e) => { e.stopPropagation(); setSel(it.app); }}
          onDoubleClick={() => openApp(it.app)}
        >
          <div className="ico" style={it.icon === "ic-doc" ? { width: 44 } : undefined}>
            <Icon id={it.icon} />
          </div>
          <div className="label">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
