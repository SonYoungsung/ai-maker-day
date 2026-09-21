import { useEffect, useState } from "react";
import { usingSupabase } from "../lib/store";
import { Icon } from "./icons";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
function fmtClock(d: Date): string {
  let h = d.getHours();
  const ampm = h < 12 ? "오전" : "오후";
  let hh = h % 12; if (hh === 0) hh = 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]}) ${ampm} ${hh}:${mm}`;
}

export default function MenuBar() {
  const [clock, setClock] = useState(() => fmtClock(new Date()));
  const live = usingSupabase();

  useEffect(() => {
    const t = setInterval(() => setClock(fmtClock(new Date())), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="menubar glass">
      <div className="brand">
        <Icon id="ic-spark" style={{ width: 16, height: 16 }} />
        <span>AI 메이커데이</span>
      </div>
      <div className="menu">
        <span>파일</span><span>보기</span><span>창</span><span>도움말</span>
      </div>
      <div className="right">
        <div className="status-ico">
          <Icon id="ic-search" style={{ width: 17, height: 17 }} />
          <Icon id="ic-wifi" style={{ width: 19, height: 16 }} />
          <Icon id="ic-batt" style={{ width: 24, height: 14 }} />
        </div>
        <span className={`live ${live ? "on" : "off"}`}>
          <span className="dot" />
          {live ? "실시간" : "로컬"}
        </span>
        <span className="clock">{clock}</span>
      </div>
    </div>
  );
}
