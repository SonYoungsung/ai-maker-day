import { useEffect, useMemo, useState } from "react";
import { SKILLS, skillById } from "../lib/skills";
import { listSubmissions, subscribe, usingSupabase, type Submission } from "../lib/store";
import ReportPreview from "../components/ReportPreview";

function StageBadge({ stage }: { stage: string }) {
  const s = skillById(stage);
  return (
    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
      {s ? `${s.emoji} ${s.ko}` : stage}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return new Date(iso).toLocaleString("ko-KR");
}

// "2026-09-21" → "9월 21일"
function fmtDate(d: string | null | undefined): string {
  if (!d) return "날짜 미상";
  const [, mo, day] = d.split("-");
  if (!mo || !day) return d;
  return `${Number(mo)}월 ${Number(day)}일`;
}

// 같은 유저인가 — 닉네임(유일 키, 대소문자 무시)으로 판정. student_id 는 보조.
function sameUser(a: Submission, b: Submission): boolean {
  if (a.student_id && b.student_id) return a.student_id === b.student_id;
  return (a.student || "").trim().toLowerCase() === (b.student || "").trim().toLowerCase();
}

// 단계 순서(SKILLS 정의 순)로 정렬하기 위한 인덱스
const stageOrder = (stage: string) => {
  const i = SKILLS.findIndex((s) => s.id === stage);
  return i === -1 ? 999 : i;
};

export default function Dashboard() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  // 클릭한 제출(=유저 앵커) + 모달 안에서 현재 보고 있는 보고서
  const [anchor, setAnchor] = useState<Submission | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);

  async function refresh() {
    try {
      setRows(await listSubmissions());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    return unsub;
  }, []);

  const dates = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.class_date).filter(Boolean)))
        .sort()
        .reverse(),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (stageFilter !== "all" && r.stage !== stageFilter) return false;
      if (dateFilter !== "all" && r.class_date !== dateFilter) return false;
      if (query && !r.student.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [rows, stageFilter, dateFilter, query]);

  const studentCount = useMemo(
    () => new Set(rows.map((r) => r.student.trim().toLowerCase())).size,
    [rows]
  );

  // 앵커 유저의 모든 보고서 (날짜 desc → 단계 순)
  const userReports = useMemo(() => {
    if (!anchor) return [];
    return rows
      .filter((r) => sameUser(r, anchor))
      .sort((a, b) => {
        const da = a.class_date || "";
        const db = b.class_date || "";
        if (da !== db) return da < db ? 1 : -1; // 날짜 내림차순
        if (a.stage !== b.stage) return stageOrder(a.stage) - stageOrder(b.stage);
        return a.created_at < b.created_at ? -1 : 1;
      });
  }, [rows, anchor]);

  // 날짜별로 그룹 (좌측 목록용)
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Submission[]>();
    for (const r of userReports) {
      const key = r.class_date || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()];
  }, [userReports]);

  function openUser(r: Submission) {
    setAnchor(r);
    setSelected(r);
  }
  function close() {
    setAnchor(null);
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">강사 대시보드</h1>
          <p className="mt-1 text-sm text-slate-400">
            제출 {rows.length}건 · 학생 {studentCount}명 ·{" "}
            {usingSupabase() ? "실시간 수집 중" : "로컬 저장 모드"}
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          새로고침
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="all">전체 날짜</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {fmtDate(d)}
            </option>
          ))}
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="all">전체 단계</option>
          {SKILLS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.ko}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임 검색"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          에러: {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-slate-500">
          아직 제출이 없어요. 학생이 제출하면 여기에 실시간으로 나타납니다.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => openUser(r)}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{r.student}</span>
                <span className="text-xs text-slate-500">{timeAgo(r.created_at)}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <StageBadge stage={r.stage} />
                <span className="text-[11px] text-slate-500">{fmtDate(r.class_date)}</span>
              </div>
              {r.project && (
                <div className="mt-2 text-sm text-slate-200">{r.project}</div>
              )}
              {r.summary && (
                <div className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {r.summary}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 유저 상세 모달: 그 유저의 모든 보고서 */}
      {anchor && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
          onClick={close}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div>
                <div className="font-bold">{anchor.student}</div>
                <div className="mt-0.5 text-xs text-slate-400">
                  보고서 {userReports.length}건 ·{" "}
                  {new Set(userReports.map((r) => r.class_date)).size}일치
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                닫기
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
              {/* 좌: 날짜/단계별 보고서 목록 */}
              <aside className="thin-scroll max-h-40 shrink-0 overflow-auto border-b border-slate-800 p-3 sm:max-h-none sm:w-64 sm:border-b-0 sm:border-r">
                {groupedByDate.map(([date, items]) => (
                  <div key={date || "unknown"} className="mb-3">
                    <div className="mb-1 px-1 text-xs font-semibold text-slate-500">
                      {fmtDate(date)}
                    </div>
                    <div className="space-y-1">
                      {items.map((r) => {
                        const active = selected?.id === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                              active
                                ? "bg-indigo-500/20 text-indigo-200"
                                : "text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            <StageBadge stage={r.stage} />
                            <span className="text-[10px] text-slate-500">
                              {timeAgo(r.created_at)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </aside>

              {/* 우: 선택한 보고서 미리보기 */}
              <div className="flex min-h-0 flex-1 flex-col">
                {selected ? (
                  <>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <StageBadge stage={selected.stage} />
                        <span>{new Date(selected.created_at).toLocaleString("ko-KR")}</span>
                      </div>
                      <a
                        href={`data:text/html;charset=utf-8,${encodeURIComponent(selected.report_html)}`}
                        download={`${selected.student}-${selected.class_date}-${selected.stage}.html`}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                      >
                        HTML 다운로드
                      </a>
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto bg-white">
                      <ReportPreview
                        html={selected.report_html}
                        className="h-[70vh] w-full border-0 bg-white"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
                    왼쪽에서 보고서를 선택하세요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
