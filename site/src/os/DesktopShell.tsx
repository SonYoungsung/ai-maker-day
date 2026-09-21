import { useRef } from "react";
import "./os.css";
import { WindowsProvider, useWindows } from "./windows";
import { IconDefs } from "./icons";
import Window from "./Window";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import DesktopIcons from "./DesktopIcons";
import BootLogin from "./BootLogin";

function ShellInner() {
  const { windows } = useWindows();
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);

  // 최상단(활성) 창
  let topId: string | null = null, topZ = -1;
  for (const w of windows) {
    if (!w.min && w.z > topZ) { topZ = w.z; topId = w.id; }
  }

  function onMove(e: React.PointerEvent) {
    const cx = e.clientX / window.innerWidth - 0.5;
    const cy = e.clientY / window.innerHeight - 0.5;
    if (blob1.current) { blob1.current.style.setProperty("--px", `${-cx * 16}px`); blob1.current.style.setProperty("--py", `${-cy * 16}px`); }
    if (blob2.current) { blob2.current.style.setProperty("--px", `${-cx * 32}px`); blob2.current.style.setProperty("--py", `${-cy * 32}px`); }
  }

  return (
    <div className="os-root" onPointerMove={onMove}>
      <IconDefs />
      <div className="os-blob b1" ref={blob1} />
      <div className="os-blob b2" ref={blob2} />

      <DesktopIcons />

      <div className="os-windows">
        {windows.map((w) => (
          <Window key={w.id} win={w} active={w.id === topId} />
        ))}
      </div>

      <Dock />
      <MenuBar />
      <BootLogin />

      <div className="small-note">
        <b>데스크톱에서 열어주세요</b>
        <div>이 사이트는 데스크톱 OS 경험이라 넓은 화면에서 가장 잘 보여요.</div>
      </div>
    </div>
  );
}

export default function DesktopShell() {
  return (
    <WindowsProvider>
      <ShellInner />
    </WindowsProvider>
  );
}
