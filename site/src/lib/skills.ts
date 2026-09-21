// 원데이 클래스 스킬 8종 메타데이터.
// 실제 프롬프트 본문은 public/skills/<id>.md 에서 fetch 하거나 다운로드한다.
export interface SkillMeta {
  id: string; // 파일명 = 단계 코드 (제출 데이터의 stage 값과 동일)
  order: number;
  ko: string; // 한국어 이름
  title: string; // 스킬 내부 제목
  emoji: string;
  period: string; // 교시
  desc: string; // 한 줄 소개
  output: string; // 이 스킬의 최종 결과물(제출 단위)
}

export const SKILLS: SkillMeta[] = [
  {
    id: "01-idea-coach",
    order: 1,
    ko: "아이디어 코치",
    title: "AI Project Idea Coach",
    emoji: "💡",
    period: "1교시",
    desc: "관심사에서 출발해 오늘 만들 프로젝트 아이디어를 찾는다.",
    output: "Project Build Specification",
  },
  {
    id: "02-project-planner",
    order: 2,
    ko: "프로젝트 플래너",
    title: "AI Project Planner",
    emoji: "🗺️",
    period: "2교시",
    desc: "아이디어를 오늘 만들 수 있는 설계도로 바꾼다.",
    output: "Project Brief",
  },
  {
    id: "03-ux-designer",
    order: 3,
    ko: "UX 디자이너",
    title: "AI UX Designer",
    emoji: "🎨",
    period: "2~3교시",
    desc: "화면과 사용 흐름을 명확하게 정한다.",
    output: "UX Specification",
  },
  {
    id: "04-coding-partner",
    order: 4,
    ko: "코딩 파트너",
    title: "AI Coding Partner",
    emoji: "🤖",
    period: "3교시",
    desc: "AI와 함께 실제로 작동하는 첫 버전을 만든다.",
    output: "Done / Test / Next",
  },
  {
    id: "05-debugging-coach",
    order: 5,
    ko: "디버깅 코치",
    title: "AI Debugging Coach",
    emoji: "🐞",
    period: "4교시",
    desc: "문제를 구체적으로 설명하고 스스로 해결한다.",
    output: "Problem / Cause / Fix / Learned",
  },
  {
    id: "06-feature-builder",
    order: 6,
    ko: "기능 빌더",
    title: "AI Feature Builder",
    emoji: "🧩",
    period: "4교시",
    desc: "작동하는 프로젝트에 기능을 하나씩 추가한다.",
    output: "Added / How to Use / Next",
  },
  {
    id: "07-design-coach",
    order: 7,
    ko: "디자인 코치",
    title: "AI Design Coach",
    emoji: "✨",
    period: "4교시",
    desc: "\"내가 만든 느낌\"이 나도록 디자인을 다듬는다.",
    output: "Design Changes / Before→After",
  },
  {
    id: "08-demo-coach",
    order: 8,
    ko: "데모 코치",
    title: "AI Demo Coach",
    emoji: "🎤",
    period: "5교시",
    desc: "3분 발표문과 시연 순서를 만든다.",
    output: "3-Minute Demo 발표문",
  },
];

export const skillById = (id: string): SkillMeta | undefined =>
  SKILLS.find((s) => s.id === id);

// public/skills/<id>.md 경로 (base 경로 고려)
export const skillFileUrl = (id: string): string =>
  `${import.meta.env.BASE_URL}skills/${id}.md`;
