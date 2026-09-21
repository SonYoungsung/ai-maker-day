import { useEffect, useRef, useState } from "react";
import { useStudent } from "../lib/useStudent";
import { useWindows } from "./windows";
import { Icon } from "./icons";

type Phase = "boot" | "login" | "done";

export default function BootLogin() {
  const { nickname, status, claim } = useStudent();
  const { enterDesktop } = useWindows();
  const [phase, setPhase] = useState<Phase>("boot");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const entered = useRef(false);

  function enter() {
    if (entered.current) return;
    entered.current = true;
    setPhase("done");
    enterDesktop();
  }

  // 부팅 후 로그인 화면으로
  useEffect(() => {
    const t = setTimeout(() => {
      if (!entered.current) setPhase((p) => (p === "boot" ? "login" : p));
    }, 1250);
    return () => clearTimeout(t);
  }, []);

  // 이미 로그인된(정체성 ready) 사용자는 자동 진입
  useEffect(() => {
    if (status === "ready" && !entered.current) enter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function onGo() {
    const n = name.trim();
    if (!n) { setErr("닉네임을 입력해 주세요."); return; }
    setBusy(true); setErr("");
    try {
      const res = await claim(n);
      if (res.status === "taken") setErr("이미 사용 중인 닉네임이에요. 다른 걸 골라주세요.");
      else if (res.status === "error") setErr(`오류: ${res.message}`);
      else enter();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* 부팅 */}
      <div className={`overlay${phase !== "boot" ? " hide" : ""}`}>
        <svg className="boot-logo" viewBox="0 0 120 120" aria-hidden>
          <rect x="12" y="12" width="96" height="96" rx="26" fill="url(#g-brand)" />
          <rect x="12" y="12" width="96" height="96" rx="26" fill="url(#g-tophi)" />
          <g transform="translate(36 36) scale(2)">
            <path d="M12 2 L14 9.5 L21.5 12 L14 14.5 L12 22 L10 14.5 L2.5 12 L10 9.5 Z" fill="#fff" />
          </g>
        </svg>
        <div className="boot-name">AI 메이커 OS</div>
        <div className="prog"><i /></div>
      </div>

      {/* 로그인 (닉네임 클레임) */}
      <div className={`overlay${phase !== "login" ? " hide" : ""}`}>
        <div className="avatar"><Icon id="ic-spark" /></div>
        <div className="login-who">{status === "ready" && nickname ? nickname : "AI 메이커"}</div>
        <div className="login-hint">오늘 쓸 닉네임을 정하고 들어가요 (Enter)</div>
        <div className="login-row">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") onGo(); }}
            placeholder="예: 코딩하는너구리"
            autoFocus
          />
          <button className="login-go" onClick={onGo} disabled={busy}>→</button>
        </div>
        <div className="login-err">{err}</div>
      </div>

      {phase !== "done" && (
        <div className="skip" onClick={enter}>건너뛰기 →</div>
      )}
    </>
  );
}
