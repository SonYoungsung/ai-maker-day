// submission-footer.md의 새 footer를 site/public/skills/*.md 8개에 반영한다.
// 각 파일의 기존 '## 📤 마지막 단계' 블록을 잘라내고, __STAGE__를 해당 stage id로,
// __HANDOFF__를 "다음 단계 안내"(마지막 단계는 마무리 문구)로 치환한 새 footer로 교체한다.
// 스킬 본문(그 앞부분)은 그대로 유지된다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "## 📤 마지막 단계";

// 1) 템플릿에서 footer 본문(## 📤 ...부터 끝까지) 추출
const tplRaw = readFileSync(join(root, "report-templates/submission-footer.md"), "utf8");
const tplIdx = tplRaw.indexOf(MARKER);
if (tplIdx === -1) throw new Error("템플릿에서 footer 마커를 찾지 못함");
const footerTpl = tplRaw.slice(tplIdx).trimEnd();

// 단계 순서 + 다음 단계 안내에 쓸 한글 이름/한 줄 설명
const STAGES = [
  { id: "01-idea-coach", ko: "아이디어 코치", desc: "오늘 만들 프로젝트 아이디어를 정한다" },
  { id: "02-project-planner", ko: "프로젝트 플래너", desc: "아이디어를 오늘 만들 수 있는 설계도로 바꾼다" },
  { id: "03-ux-designer", ko: "UX 디자이너", desc: "화면과 사용 흐름을 명확히 정한다" },
  { id: "04-coding-partner", ko: "코딩 파트너", desc: "AI와 함께 실제로 작동하는 첫 버전을 만든다" },
  { id: "05-debugging-coach", ko: "디버깅 코치", desc: "문제를 구체적으로 설명하고 스스로 해결한다" },
  { id: "06-feature-builder", ko: "기능 빌더", desc: "작동하는 프로젝트에 기능을 하나씩 추가한다" },
  { id: "07-design-coach", ko: "디자인 코치", desc: "'내가 만든 느낌'이 나도록 디자인을 다듬는다" },
  { id: "08-demo-coach", ko: "데모 코치", desc: "3분 발표문과 시연 순서를 만든다" },
];

function handoffFor(i) {
  const next = STAGES[i + 1];
  if (!next) {
    // 마지막 단계: 다음 스킬 없음 → 마무리 안내
    return "오늘 8단계를 모두 마쳤어! 바탕화면 `AI메이커데이` 폴더에 보고서 8개(`01`~`08`)가 다 모였는지 확인하고, 발표를 멋지게 해보자.";
  }
  return `이제 다음은 **${next.ko}** 단계야 — ${next.desc}. 준비되면 다음 스킬 파일(\`${next.id}.md\`)을 **이 대화에 이어서** 넣어줘. 지금까지 정리한 내용을 그대로 이어받아 진행할게.`;
}

STAGES.forEach((stage, i) => {
  const path = join(root, "site/public/skills", `${stage.id}.md`);
  const content = readFileSync(path, "utf8");
  const idx = content.indexOf(MARKER);
  if (idx === -1) throw new Error(`${stage.id}: 기존 footer 마커 없음`);

  // footer 앞 본문에서 끝의 '---' 구분선/공백 제거
  const body = content.slice(0, idx).replace(/\n*-{3,}\s*$/g, "").trimEnd();
  const footer = footerTpl
    .replaceAll("__STAGE__", stage.id)
    .replaceAll("__HANDOFF__", handoffFor(i));
  writeFileSync(path, `${body}\n\n---\n\n${footer}\n`, "utf8");
  console.log(`✓ ${stage.id}.md`);
});
console.log("done");
