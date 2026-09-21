import { NavLink } from "react-router-dom";
import { usingSupabase } from "../lib/store";

const links = [
  { to: "/", label: "홈", end: true },
  { to: "/setup", label: "준비하기", end: false },
  { to: "/materials", label: "강의 자료", end: false },
  { to: "/submit", label: "결과 제출", end: false },
  { to: "/dashboard", label: "대시보드", end: false },
];

export default function Nav() {
  const live = usingSupabase();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#0b0f1a]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
        <NavLink to="/" className="mr-3 flex items-center gap-2 font-bold">
          <span className="text-lg">🚀</span>
          <span className="hidden sm:inline">원데이 AI 클래스</span>
        </NavLink>
        <div className="flex flex-1 items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <span
          title={live ? "Supabase 실시간 수집 중" : "로컬 저장 모드 (Supabase 미연결)"}
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:flex ${
            live
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-amber-500/15 text-amber-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              live ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          {live ? "실시간" : "로컬"}
        </span>
      </nav>
    </header>
  );
}
