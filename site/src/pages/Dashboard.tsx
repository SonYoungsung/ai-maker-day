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

export default function Dashboard() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Submission | null>(null);

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

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (stageFilter !== "all" && r.stage !== stageFilter) return false;
      if (query && !r.student.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [rows, stageFilter, query]);

  const studentCount = useMemo(
    () => new Set(rows.map((r) => r.student)).size,
    [rows]
  );

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
              onClick={() => setOpen(r)}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{r.student}</span>
                <span className="text-xs text-slate-500">{timeAgo(r.created_at)}</span>
              </div>
              <div className="mt-2">
                <StageBadge stage={r.stage} />
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

      {/* 보고서 상세 모달 */}
      {open && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div>
                <div className="font-bold">{open.student}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                  <StageBadge stage={open.stage} />
                  <span>{new Date(open.created_at).toLocaleString("ko-KR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`data:text/html;charset=utf-8,${encodeURIComponent(open.report_html)}`}
                  download={`${open.student}-${open.stage}.html`}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  HTML 다운로드
                </a>
                <button
                  onClick={() => setOpen(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  닫기
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <ReportPreview
                html={open.report_html}
                className="h-[75vh] w-full border-0 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
