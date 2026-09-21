import { AppLink } from "../os/windows";

function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5 pl-14">
      <span className="absolute left-4 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
        {n}
      </span>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-1 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export default function Setup() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold">준비하기</h1>
        <p className="mt-1 text-slate-400">
          스킬이 만든 <b className="text-slate-200">HTML 보고서</b>를 바탕화면 폴더에 자동으로 저장하고
          싶다면, Claude 데스크탑 앱에 공식 <b className="text-slate-200">Filesystem</b> 익스텐션을 한 번만
          설치하면 돼요. (필수는 아니에요 — 설치 안 하면 다운로드해서 직접 저장합니다.)
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
          <div className="font-semibold text-emerald-300">✅ 익스텐션을 켜면</div>
          <p className="mt-1 text-slate-300">
            Claude가 <code className="rounded bg-slate-800 px-1">바탕화면/AI메이커데이</code> 폴더를 만들고
            보고서를 <b>자동 저장</b>해요. 8단계를 하면 파일 8개가 순서대로 쌓여요.
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-sm">
          <div className="font-semibold text-slate-200">🙆 안 켜도 괜찮아요</div>
          <p className="mt-1 text-slate-300">
            Claude가 HTML을 <b>다운로드</b>로 주면, 내가 바탕화면 <b>AI메이커데이</b> 폴더에 저장하거나,
            HTML을 복사해서 바로 제출하면 돼요.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">설치 방법 (3단계)</h2>
        <StepCard n={1} title="설정 → Extensions 열기">
          Claude 데스크탑 앱 왼쪽 아래 <b>Settings</b>(톱니 아이콘) → 사이드바 <b>Extensions</b>.
        </StepCard>
        <StepCard n={2} title="Filesystem 찾아서 설치">
          <b>Browse Extensions</b>에서 <b>Filesystem</b>을 찾아 <b>+</b> → <b>Install</b>. (무료 요금제 포함
          누구나 가능)
        </StepCard>
        <StepCard n={3} title="바탕화면 폴더 접근 허용">
          <b>Add directory</b>로 <b>바탕화면(Desktop)</b>을 선택하고 <b>Save</b>. 그래야 Claude가 그 안에
          <code className="rounded bg-slate-800 px-1">AI메이커데이</code> 폴더를 새로 만들 수 있어요.
        </StepCard>
        <p className="text-sm text-slate-400">
          입력창 근처 <b>망치(도구) 아이콘</b>에 파일 도구가 보이면 준비 끝!
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-bold">스킬을 쓸 때는 이렇게</h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-300">
          <li>
            <b className="text-indigo-300">1.</b> 각 단계 마지막에 Claude가
            <b> "AI메이커데이 폴더에 저장할게"</b>라고 말하며 저장을 시도해요.
          </li>
          <li>
            <b className="text-indigo-300">2.</b> <b>권한 팝업</b>이 뜨면 <b>Allow(허용)</b>. 매번 묻는 게
            귀찮으면 <b>"이 채팅에서 항상 허용"</b>을 골라요.
          </li>
          <li>
            <b className="text-indigo-300">3.</b> "이 부분 바꿔줘"로 다듬으면 <b>같은 파일이 덮어써져요.</b>
          </li>
          <li>
            <b className="text-indigo-300">4.</b> 완성되면{" "}
            <AppLink app="submit" className="text-indigo-300 underline">
              결과 제출
            </AppLink>{" "}
            페이지에 그 파일을 올려요.
          </li>
        </ol>
      </section>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
        <b className="text-slate-300">안심하세요</b> — 익스텐션은 <b>허용한 폴더 안에서만</b> 동작하고, 내
        컴퓨터에서 <b>로컬로만</b> 실행돼요. 연결한다고 파일이 어디로 업로드되지 않아요. (그래서 바탕화면
        같은 전용 폴더만 허용하는 걸 권장해요.)
        <div className="mt-2 text-slate-500">
          Windows는 <code className="rounded bg-slate-800 px-1">%USERPROFILE%\Desktop</code>, Mac은{" "}
          <code className="rounded bg-slate-800 px-1">~/Desktop</code> — 폴더 이름은 <b>AI메이커데이</b>로
          같아요.
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <AppLink
          app="materials"
          className="rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
        >
          준비 끝 · 강의 자료 보기
        </AppLink>
        <AppLink
          app="home"
          className="rounded-xl border border-slate-700 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          홈으로
        </AppLink>
      </div>
    </div>
  );
}
