import { AppLink } from "./windows";

export default function Help() {
  return (
    <div className="space-y-4 text-slate-200">
      <h1 className="text-xl font-extrabold">원데이 AI 클래스</h1>
      <p className="text-sm text-slate-400">
        중·고등학생이 AI와 함께 아이디어부터 발표까지 하루 만에 완성하는 클래스예요.
      </p>
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm">
        <b className="text-indigo-300">이 사이트가 하는 일</b>
        <ol className="mt-2 space-y-1.5 text-slate-300">
          <li>1. 단계별 <b>스킬(프롬프트)</b>을 <AppLink app="materials" className="text-indigo-300 underline">강의 자료</AppLink>에서 복사해 Claude에 붙여넣어요.</li>
          <li>2. Claude가 만든 <b>HTML 보고서</b>를 <AppLink app="submit" className="text-indigo-300 underline">결과 제출</AppLink>에 올려요.</li>
          <li>3. 강사는 <AppLink app="dashboard" className="text-indigo-300 underline">대시보드</AppLink>에서 실시간으로 확인해요.</li>
        </ol>
      </div>
      <p className="text-xs text-slate-500">
        Dock 또는 바탕화면 아이콘으로 각 앱을 열 수 있어요. 창은 드래그로 옮기고 가장자리로 크기를
        조절할 수 있어요.
      </p>
    </div>
  );
}
