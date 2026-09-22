import { useState } from "react";
import { SKILLS, skillFileUrl, type SkillMeta } from "../lib/skills";

function SkillCard({ skill }: { skill: SkillMeta }) {
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchBody(): Promise<string> {
    const res = await fetch(skillFileUrl(skill.id));
    if (!res.ok) throw new Error(`불러오기 실패 (${res.status})`);
    return res.text();
  }

  async function copyPrompt() {
    try {
      const body = await fetchBody();
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      alert(`복사 실패: ${e instanceof Error ? e.message : e}`);
    }
  }

  async function togglePreview() {
    if (preview !== null) {
      setPreview(null);
      return;
    }
    setLoading(true);
    try {
      setPreview(await fetchBody());
    } catch (e) {
      setPreview(`불러오기 실패: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{skill.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {skill.period}
            </span>
            <h3 className="font-bold">
              {skill.order}. {skill.ko}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">{skill.desc}</p>
          <p className="mt-1 text-xs text-slate-500">
            최종 결과물: <span className="text-slate-400">{skill.output}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={copyPrompt}
          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          {copied ? "복사됨 ✓" : "프롬프트 복사"}
        </button>
        <a
          href={skillFileUrl(skill.id)}
          download={`${skill.id}.md`}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          다운로드
        </a>
        <button
          onClick={togglePreview}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          {preview !== null ? "닫기" : loading ? "불러오는 중…" : "미리보기"}
        </button>
      </div>

      {preview !== null && (
        <pre className="thin-scroll mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-300">
          {preview}
        </pre>
      )}
    </div>
  );
}

export default function Materials() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold">강의 자료</h1>
        <p className="mt-1 text-slate-400">
          단계별 스킬 프롬프트예요. <b className="text-slate-200">프롬프트 복사</b>를 눌러
          Claude 데스크탑 앱의 새 대화에 붙여넣고 시작하세요.
        </p>
      </header>

      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-sm text-slate-300">
        <b className="text-indigo-300">사용법</b> — 스킬은 순서대로 진행하면 좋아요. 각 단계가
        끝나면 Claude가 제출용 <b>HTML 보고서</b>를 만들어줍니다. 그 파일을 내려받아{" "}
        <b>결과 제출</b> 페이지에 올리면 됩니다.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SKILLS.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    </div>
  );
}
