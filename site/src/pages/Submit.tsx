import { useMemo, useState } from "react";
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

export default function Submit() {
  const { nickname, studentId, status: idStatus } = useStudent();
  const [stage, setStage] = useState<string>(SKILLS[0].id);
  const [html, setHtml] = useState<string>("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const parsed = useMemo(() => (html.trim() ? parseReport(html) : null), [html]);
  const ready = idStatus === "ready" && !!nickname;

  // 붙여넣은 보고서에 stage 정보가 있으면 단계를 자동으로 맞춘다.
  // (닉네임은 정체성으로 고정이므로 자동 변경하지 않는다.)
  function applyMetaDefaults() {
    if (!parsed?.meta) return;
    if (parsed.meta.stage && skillById(String(parsed.meta.stage))) {
      setStage(String(parsed.meta.stage));
    }
  }

  async function onFile(file: File) {
    const text = await file.text();
    setHtml(text);
    setStatus({ kind: "idle" });
  }

  async function submit() {
    if (!ready) {
      setStatus({ kind: "error", message: "먼저 홈에서 닉네임을 정해 주세요." });
      return;
    }
    if (!html.trim()) {
      setStatus({ kind: "error", message: "제출할 HTML 보고서를 붙여넣거나 업로드해 주세요." });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const meta = parsed?.meta ?? null;
      const row = await saveSubmission({
        student: nickname,
        student_id: studentId,
        stage,
        project: (meta?.project as string) ?? null,
        summary: metaSummary(meta) || null,
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

  const currentSkill = skillById(stage);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">결과 제출</h1>
        <p className="mt-1 text-slate-400">
          Claude가 만들어준 HTML 보고서를 붙여넣거나 파일로 올리세요. 미리보기로 확인한 뒤
          제출합니다.
        </p>
        {!usingSupabase() && (
          <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            지금은 <b>로컬 저장 모드</b>예요 (Supabase 미연결). 제출물은 이 브라우저에만
            저장됩니다. 실제 수업에서는 Supabase를 연결하세요.
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 영역 */}
        <div className="space-y-4">
          {/* 제출자(정체성) — 홈에서 정한 닉네임으로 고정 */}
          {ready ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm">
              <span className="text-slate-400">
                제출자{" "}
                <b className="ml-1 text-indigo-300">{nickname}</b>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              어떤 단계의 결과인가요?
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
            >
              {SKILLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.order}. {s.ko} — {s.output}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                HTML 보고서
              </label>
              <label className="cursor-pointer rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-slate-800">
                파일 업로드
                <input
                  type="file"
                  accept=".html,text/html"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }}
                />
              </label>
            </div>
            <textarea
              value={html}
              onChange={(e) => {
                setHtml(e.target.value);
                setStatus({ kind: "idle" });
              }}
              placeholder="<!--ONEDAY ... --> 로 시작하는 HTML을 여기에 붙여넣으세요."
              className="thin-scroll h-56 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-relaxed outline-none focus:border-indigo-400"
            />
          </div>

          {/* 파싱 결과 안내 */}
          {parsed && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm">
              {parsed.meta ? (
                <div className="space-y-1">
                  <div className="text-emerald-300">✓ 제출 데이터를 인식했어요</div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-slate-400">
                    {parsed.meta.student && (
                      <>
                        <dt>학생</dt>
                        <dd className="text-slate-200">{String(parsed.meta.student)}</dd>
                      </>
                    )}
                    {parsed.meta.stage && (
                      <>
                        <dt>단계</dt>
                        <dd className="text-slate-200">{String(parsed.meta.stage)}</dd>
                      </>
                    )}
                    {parsed.meta.project && (
                      <>
                        <dt>프로젝트</dt>
                        <dd className="text-slate-200">{String(parsed.meta.project)}</dd>
                      </>
                    )}
                  </dl>
                  <button
                    onClick={applyMetaDefaults}
                    className="mt-1 text-xs text-indigo-300 underline"
                  >
                    이 정보로 단계 자동 맞추기
                  </button>
                </div>
              ) : parsed.parseError ? (
                <div className="text-amber-300">⚠ {parsed.parseError}</div>
              ) : (
                <div className="text-amber-300">
                  ⚠ 숨은 제출 데이터(ONEDAY 블록)가 없어요. 그래도 제출할 수 있지만, 위에서
                  단계를 직접 골라주세요.
                </div>
              )}
              {!parsed.isHtmlDoc && html.trim() && (
                <div className="mt-1 text-xs text-slate-500">
                  참고: HTML 문서 형태가 아닌 것 같아요. 미리보기가 비어 보일 수 있어요.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={status.kind === "saving" || !ready}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
            >
              {status.kind === "saving" ? "제출 중…" : "제출하기"}
            </button>
            {status.kind === "done" && (
              <span className="text-sm text-emerald-300">
                제출 완료! →{" "}
                <AppLink app="dashboard" className="underline">
                  대시보드에서 보기
                </AppLink>
              </span>
            )}
            {status.kind === "error" && (
              <span className="text-sm text-red-400">에러: {status.message}</span>
            )}
          </div>
        </div>

        {/* 미리보기 영역 */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">미리보기</span>
            {currentSkill && (
              <span className="text-xs text-slate-500">
                {currentSkill.emoji} {currentSkill.ko}
              </span>
            )}
          </div>
          {html.trim() ? (
            <ReportPreview html={html} className="h-[60vh] w-full rounded-xl border border-slate-700 bg-white" />
          ) : (
            <div className="flex h-[60vh] items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
              여기에 보고서 미리보기가 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
