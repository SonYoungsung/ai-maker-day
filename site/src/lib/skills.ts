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
    id: "01-idea-mvp",
    order: 1,
    ko: "아이디어 → 첫 버전",
    short: "첫 버전",
    title: "AI Maker — 아이디어에서 작동하는 첫 버전까지",
    emoji: "🚀",
    desc: "질문은 하나만. 아이디어를 고르면 곧바로 작동하는 첫 버전까지 만든다.",
    output: "작동하는 내프로젝트.html + 첫 버전 기록",
  },
  {
    id: "02-upgrade",
    order: 2,
    ko: "깎기",
    short: "깎기",
    title: "AI Maker — 깎기 (업그레이드 루프)",
    emoji: "🔨",
    desc: "고칠 데를 먼저 제안받고 한 군데씩 바꾼다. 만족할 때까지 반복하는 단계.",
    output: "깎기 기록 (바퀴마다 제출)",
  },
  {
    id: "03-demo",
    order: 3,
    ko: "발표 준비",
    short: "발표",
    title: "AI Maker — 발표 준비",
    emoji: "🎤",
    desc: "앞 기록으로 발표문 초안을 바로 받아 말투와 길이를 고친다.",
    output: "3분 발표문",
  },
];

export const skillById = (id: string): SkillMeta | undefined =>
  SKILLS.find((s) => s.id === id);

// public/skills/<id>.md 경로 (base 경로 고려)
export const skillFileUrl = (id: string): string =>
  `${import.meta.env.BASE_URL}skills/${id}.md`;
