// 원데이 클래스 스킬 5종 메타데이터.
// 순서대로 진행하되 단계별 소요 시간은 고정하지 않는다(학생마다 유동적) → 시간 정보는 담지 않는다.
// 실제 프롬프트 본문은 public/skills/<id>.md 에서 fetch 하거나 다운로드한다.
// (본문은 skills/<id>.md 가 원본이고 scripts/build-skills.mjs 가 public 으로 조립한다.
//  여기 id·순서는 그 스크립트의 STAGES 와 일치해야 한다.)
export interface SkillMeta {
  id: string; // 파일명 = 단계 코드 (제출 데이터의 stage 값과 동일)
  order: number;
  ko: string; // 한국어 이름
  short: string; // 진행 순서 레일에 쓰는 짧은 이름
  title: string; // 스킬 내부 제목
  emoji: string;
  desc: string; // 한 줄 소개
  output: string; // 이 스킬의 최종 결과물(제출 단위)
}

export const SKILLS: SkillMeta[] = [
  {
    id: "01-idea-coach",
    order: 1,
    ko: "아이디어 코치",
    short: "아이디어",
    title: "AI Project Idea Coach",
    emoji: "💡",
    desc: "관심사에서 출발해 오늘 만들 프로젝트 아이디어를 찾는다.",
    output: "Project Build Specification",
  },
  {
    id: "02-blueprint",
    order: 2,
    ko: "설계 스튜디오",
    short: "설계",
    title: "AI Blueprint Studio",
    emoji: "🗺️",
    desc: "화면·흐름·분위기까지 한 장의 설계도로 정리한다.",
    output: "Project Blueprint",
  },
  {
    id: "03-build",
    order: 3,
    ko: "첫 버전 만들기",
    short: "첫 버전",
    title: "AI Build Partner",
    emoji: "🤖",
    desc: "설계도대로 실제 작동하는 첫 버전을 만든다. (막히면 디버깅 루프 내장)",
    output: "작동하는 첫 버전 + Build Log",
  },
  {
    id: "04-upgrade",
    order: 4,
    ko: "업그레이드",
    short: "업그레이드",
    title: "AI Upgrade Partner",
    emoji: "✨",
    desc: "기능을 더하고 \"내가 만든 느낌\"이 나도록 다듬는다.",
    output: "Upgrade Log",
  },
  {
    id: "05-demo-coach",
    order: 5,
    ko: "데모 코치",
    short: "발표",
    title: "AI Demo Coach",
    emoji: "🎤",
    desc: "3분 발표문과 시연 순서를 만든다.",
    output: "3-Minute Demo 발표문",
  },
];

export const skillById = (id: string): SkillMeta | undefined =>
  SKILLS.find((s) => s.id === id);

// public/skills/<id>.md 경로 (base 경로 고려)
export const skillFileUrl = (id: string): string =>
  `${import.meta.env.BASE_URL}skills/${id}.md`;
