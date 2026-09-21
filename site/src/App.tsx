import DesktopShell from "./os/DesktopShell";

// AI 메이커 OS — 스크롤 없는 데스크톱 OS 셸.
// 각 페이지(홈/강의자료/결과제출/대시보드/준비하기)는 드래그·리사이즈되는
// 글래스 창 안에서 렌더된다. 데이터 계층(useStudent/store)은 그대로 사용.
export default function App() {
  return <DesktopShell />;
}
