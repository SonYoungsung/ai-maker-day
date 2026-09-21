import { Link } from "react-router-dom";
import { useNickname } from "../lib/useNickname";

export default function Home() {
  const [nickname, setNickname] = useNickname();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-500/10 to-transparent p-8 sm:p-12">
        <p className="text-sm font-medium text-indigo-300">오늘의 미션</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
          AI와 함께 내가 상상한 것을
          <br />
          <span className="text-indigo-300">실제로 만드는 하루</span>
        </h1>
        <p className="mt-4 max-w-xl text-slate-300">
          코딩 문법을 외우는 하루가 아닙니다. 생각하고 → 설명하고 → 만들고 → 고치고 →
          다듬는 과정을 AI와 함께 직접 경험합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/materials"
            className="rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
          >
            강의 자료 보기
          </Link>
          <Link
            to="/submit"
            className="rounded-xl border border-slate-700 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            결과물 제출하기
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-bold">먼저, 오늘 쓸 닉네임을 정해요</h2>
        <p className="mt-1 text-sm text-slate-400">
          제출한 결과물을 한 사람으로 묶는 데 쓰여요. 실명 대신 별명을 적어주세요.
        </p>
        <div className="mt-4 flex max-w-sm items-center gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 코딩하는너구리"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
          />
          {nickname && (
            <span className="text-sm text-emerald-300">저장됨 ✓</span>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">오늘의 흐름</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["💡", "아이디어 찾기", "만들고 싶은 걸 AI와 함께 발견"],
            ["🗺️", "계획 세우기", "오늘 만들 크기로 범위 정하기"],
            ["🎨", "화면 설계", "사용 흐름과 분위기 정하기"],
            ["🤖", "함께 만들기", "AI와 첫 버전 제작"],
            ["🐞", "고치기", "문제를 설명하고 해결"],
            ["🎤", "발표하기", "내가 만든 걸 보여주기"],
          ].map(([emoji, title, desc]) => (
            <div
              key={title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="text-2xl">{emoji}</div>
              <div className="mt-2 font-semibold">{title}</div>
              <div className="text-sm text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-bold">제출은 어떻게 하나요?</h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-300">
          <li>
            <b className="text-indigo-300">1.</b> 강의 자료에서 단계별 프롬프트를 복사해
            Claude에 붙여넣고 대화해요.
          </li>
          <li>
            <b className="text-indigo-300">2.</b> 각 단계가 끝나면 Claude가 예쁜{" "}
            <b>HTML 보고서</b>를 만들어줘요. 마음에 들 때까지 "이 부분 바꿔줘"로 다듬어요.
          </li>
          <li>
            <b className="text-indigo-300">3.</b> 완성된 HTML을 복사하거나 다운로드해서{" "}
            <Link to="/submit" className="text-indigo-300 underline">
              결과 제출
            </Link>{" "}
            페이지에 올리면 끝!
          </li>
        </ol>
      </section>
    </div>
  );
}
