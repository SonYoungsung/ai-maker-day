import { useState } from "react";
import { AppLink } from "../os/windows";
import { useStudent } from "../lib/useStudent";
import { SKILLS } from "../lib/skills";

function NicknameCard() {
  const { nickname, status, claim, reset } = useStudent();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onClaim() {
    const name = value.trim();
    if (!name) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await claim(name);
      if (res.status === "taken") {
        setError("이미 사용 중인 닉네임이에요. 다른 닉네임을 골라주세요.");
      } else if (res.status === "error") {
        setError(`등록 실패: ${res.message}`);
      } else {
        setValue("");
      }
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-sm text-slate-400">닉네임 확인 중…</p>
      </section>
    );
  }

  if (status === "ready") {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-bold">
          <span className="text-indigo-300">{nickname}</span>님으로 진행 중이에요
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          이 닉네임으로 제출한 결과물이 하나로 모여요. 다음에 접속해도 다시 입력할 필요 없어요.
        </p>
        <button
          onClick={reset}
          className="mt-4 text-xs text-slate-400 underline hover:text-slate-200"
        >
          다른 닉네임으로 시작
        </button>
      </section>
    );
  }

  // anonymous / conflict
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-lg font-bold">먼저, 오늘 쓸 닉네임을 정해요</h2>
      <p className="mt-1 text-sm text-slate-400">
        제출한 결과물을 한 사람으로 묶는 <b className="text-slate-200">나만의 키</b>예요. 실명 대신
        별명을 적어주세요. 한 번 정하면 이 브라우저에서 계속 쓰여요.
      </p>
      {status === "conflict" && (
        <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          이전에 쓰던 닉네임을 확인할 수 없어요(다른 사람이 쓰고 있거나 처음 접속). 새 닉네임을
          정해주세요.
        </p>
      )}
      <div className="mt-4 flex max-w-sm items-center gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onClaim();
          }}
          placeholder="예: 코딩하는너구리"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
        />
        <button
          onClick={onClaim}
          disabled={busy}
          className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {busy ? "확인 중…" : "시작하기"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </section>
  );
}

export default function Home() {
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
          코딩 문법을 외우는 하루가 아닙니다. <b className="text-slate-200">먼저 만들어 보고</b>,
          마음에 들 때까지 <b className="text-slate-200">한 군데씩 고쳐 나가는</b> 과정을 AI와 함께
          직접 경험합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <AppLink
            app="materials"
            className="rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
          >
            강의 자료 보기
          </AppLink>
          <AppLink
            app="submit"
            className="rounded-xl border border-slate-700 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            결과물 제출하기
          </AppLink>
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Claude 데스크탑 앱만 있으면 준비 끝이에요. 단계마다 나오는 HTML 보고서를 내려받아{" "}
          <AppLink app="submit" className="font-semibold text-indigo-300 underline">
            결과 제출
          </AppLink>
          에 올리면 됩니다.
        </p>
      </section>

      <NicknameCard />

      <section>
        <h2 className="text-lg font-bold">오늘의 흐름</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400">
          이 순서대로 <b className="text-slate-300">{SKILLS.length}단계</b>를 진행해요. 2단계
          깎기는 <b className="text-slate-300">마음에 들 때까지 여러 번</b> 반복하는 단계예요.
        </p>
        {/* 단계 정보는 SKILLS 한 곳에서만 온다 — 여기에 따로 적어두면 스킬이 바뀔 때 어긋난다. */}
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s) => (
            <li key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-300">
                  {s.order}
                </span>
              </div>
              <div className="mt-2 font-semibold">{s.ko}</div>
              <div className="text-sm text-slate-400">{s.desc}</div>
            </li>
          ))}
        </ol>
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
            <b className="text-indigo-300">3.</b> 완성된 HTML을 내려받아{" "}
            <AppLink app="submit" className="text-indigo-300 underline">
              결과 제출
            </AppLink>{" "}
            페이지에 올리면 끝!
          </li>
          <li>
            <b className="text-indigo-300">4.</b> <b>깎기 단계는 한 바퀴 돌 때마다 제출</b>해요.
            여러 번 내면 내 프로젝트가 좋아지는 과정이 차곡차곡 쌓여요.
          </li>
        </ol>
      </section>
    </div>
  );
}
