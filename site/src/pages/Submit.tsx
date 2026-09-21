import { useMemo, useRef, useState } from "react";
import { AppLink } from "../os/windows";
import { SKILLS, skillById } from "../lib/skills";
import { parseReport, metaSummary } from "../lib/parse";
import { saveSubmission, usingSupabase } from "../lib/store";
import { useStudent } from "../lib/useStudent";
import ReportPreview from "../components/ReportPreview";

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "done"; id: string }
  | { kind: "error"; message: string };

function prettySize(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Submit() {
  const { nickname, studentId, status: idStatus } = useStudent();
  const [html, setHtml] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [stage, setStage] = useState(""); // 자동 인식 결과 (실패 시 학생이 직접 선택)
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => (html.trim() ? parseReport(html) : null), [html]);
  const detected =
    parsed?.meta?.stage && skillById(String(parsed.meta.stage))
      ? String(parsed.meta.stage)
      : null;
  const skill = stage ? skillById(stage) : undefined;
  const ready = idStatus === "ready" && !!nickname;
  const project = parsed?.meta?.project ? String(parsed.meta.project) : "";
  const summary = metaSummary(parsed?.meta ?? null);

  async function handleFile(f: File) {
    if (!/\.html?$/i.test(f.name) && f.type !== "text/html") {
      setStatus({ kind: "error", message: "HTML 파일(.html)만 올릴 수 있어요." });
      return;
    }
    const text = await f.text();
    const p = parseReport(text);
    const s = p.meta?.stage ? String(p.meta.stage) : "";
    setHtml(text);
    setFileInfo({ name: f.name, size: f.size });
    setStage(skillById(s) ? s : "");
    setStatus({ kind: "idle" });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function reset() {
    setHtml("");
    setFileInfo(null);
    setStage("");
    setStatus({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit() {
    if (!ready) {
      setStatus({ kind: "error", message: "먼저 홈에서 닉네임을 정해 주세요." });
      return;
    }
    if (!html.trim()) {
      setStatus({ kind: "error", message: "제출할 HTML 파일을 올려 주세요." });
      return;
    }
    if (!stage) {
      setStatus({ kind: "error", message: "어떤 단계의 결과인지 골라 주세요." });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const meta = parsed?.meta ?? null;
      const row = await saveSubmission({
        student: nickname,
        student_id: studentId,
        stage,
        project: project || null,
        summary: summary || null,
        payload: meta?.payload ?? meta ?? null,
        report_html: html,
        session_code: null,
      });
      setStatus({ kind: "done", id: row.id });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // ---------- 제출 완료 ----------
  if (status.kind === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
          ✓
        </div>
        <div>
          <h1 className="text-xl font-extrabold">제출 완료!</h1>
          <p className="mt-1 text-sm text-slate-400">
            {skill ? `${skill.emoji} ${skill.ko}` : stage} · {nickname}
          </p>
        </div>
        <div className="flex gap-2">
          <AppLink
            app="dashboard"
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            대시보드에서 보기
          </AppLink>
          <button
            onClick={reset}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            다른 파일 제출하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold">결과 제출</h1>
        <p className="mt-1 text-sm text-slate-400">
          Claude가 만든 <b className="text-slate-200">HTML 파일</b>만 올리면 끝이에요. 단계와 내용은
          파일에서 자동으로 인식돼요.
        </p>
      </header>

      {/* 제출자 / 안내 */}
      {ready ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm">
          <span className="text-slate-400">
            제출자 <b className="ml-1 text-indigo-300">{nickname}</b>
          </span>
          <AppLink app="home" className="text-xs text-slate-500 underline hover:text-slate-300">
            홈에서 변경
          </AppLink>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          먼저{" "}
          <AppLink app="home" className="font-semibold underline">
            홈
          </AppLink>
          에서 닉네임을 정해 주세요. 제출은 그 닉네임으로 하나로 모여요.
        </div>
      )}

      {!usingSupabase() && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          지금은 <b>로컬 저장 모드</b>예요 (Supabase 미연결). 제출물은 이 브라우저에만 저장됩니다.
        </p>
      )}

      {/* ---------- 파일 없음: 드롭존 ---------- */}
      {!html ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition ${
            dragging
              ? "border-indigo-400 bg-indigo-500/10"
              : "border-slate-700 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/60"
          }`}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke={dragging ? "#a5b4fc" : "#64748b"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 16v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2" />
          </svg>
          <div className="text-base font-bold">
            {dragging ? "여기에 놓으세요" : "HTML 파일을 끌어다 놓으세요"}
          </div>
          <div className="text-sm text-slate-400">
            또는 <span className="text-indigo-300 underline">클릭해서 선택</span>
          </div>
          <div className="text-xs text-slate-500">
            바탕화면 <b className="text-slate-400">AI메이커데이</b> 폴더에 저장된 파일이에요
          </div>
        </div>
      ) : (
        /* ---------- 파일 선택됨: 인식 결과 + 미리보기 + 제출 ---------- */
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="text-3xl">{skill?.emoji ?? "📄"}</div>
                <div className="min-w-0">
                  {detected ? (
                    <div className="text-xs font-semibold text-emerald-300">
                      ✓ 단계를 자동으로 인식했어요
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-amber-300">
                      ⚠ 파일에서 단계 정보를 못 찾았어요
                    </div>
                  )}
                  <div className="mt-0.5 truncate font-bold">
                    {skill ? `${skill.order}. ${skill.ko}` : "단계를 골라주세요"}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {fileInfo?.name} · {fileInfo ? prettySize(fileInfo.size) : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={reset}
                className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
              >
                다른 파일
              </button>
            </div>

            {(project || summary) && (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-slate-800 pt-3 text-xs">
                {project && (
                  <>
                    <dt className="text-slate-500">프로젝트</dt>
                    <dd className="truncate text-slate-200">{project}</dd>
                  </>
                )}
                {summary && (
                  <>
                    <dt className="text-slate-500">요약</dt>
                    <dd className="line-clamp-2 text-slate-300">{summary}</dd>
                  </>
                )}
              </dl>
            )}

            {/* 인식 실패 시에만 직접 선택 */}
            {!detected && (
              <select
                value={stage}
                onChange={(e) => {
                  setStage(e.target.value);
                  setStatus({ kind: "idle" });
                }}
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">어떤 단계의 결과인가요?</option>
                {SKILLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.order}. {s.ko}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 주요 동작은 스크롤 없이 바로 보이도록 미리보기보다 위에 둔다 */}
          <button
            onClick={submit}
            disabled={status.kind === "saving" || !ready || !stage}
            className="w-full rounded-xl bg-indigo-500 px-5 py-3 font-bold text-white transition hover:bg-indigo-400 disabled:opacity-40"
          >
            {status.kind === "saving" ? "제출 중…" : "제출하기"}
          </button>

          {/* 확인용 미리보기 */}
          <div>
            <div className="mb-1 text-xs font-medium text-slate-500">미리보기</div>
            <ReportPreview
              html={html}
              className="h-64 w-full rounded-xl border border-slate-700 bg-white"
            />
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".html,text/html"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {status.kind === "error" && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {status.message}
        </p>
      )}
    </div>
  );
}
