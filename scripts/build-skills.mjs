// skills/<id>.md (원본) → site/public/skills/<id>.md (배포본) 을 한 번에 조립한다.
//
//   원본 본문
//   + __DEBUG_BLOCK__ 치환 (report-templates/debug-block.md)
//   + H1 바로 아래에 공통 진행규칙 (report-templates/interaction-preamble.md)
//   + 끝에 공통 제출 footer (report-templates/submission-footer.md)
//       __STAGE__   → 단계 id
//       __HANDOFF__ → 다음 단계 안내 (마지막 단계는 마무리 문구)
//
// 원본(skills/)이 단일 진실원이다. site/public/skills/ 는 항상 이 스크립트의 출력물이므로
// 직접 고치지 말고 원본을 고친 뒤 `node scripts/build-skills.mjs` 를 다시 돌린다.
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(root, "site/public/skills");

// 단계 순서 + 다음 단계 안내에 쓸 한글 이름/한 줄 설명.
// site/src/lib/skills.ts 의 SKILLS 와 id·순서가 일치해야 한다.
const STAGES = [
  { id: "01-idea-coach", ko: "아이디어 코치", desc: "오늘 만들 프로젝트 아이디어를 정한다" },
  { id: "02-blueprint", ko: "설계 스튜디오", desc: "화면·흐름·분위기까지 하나의 설계도로 정리한다" },
  { id: "03-build", ko: "첫 버전 만들기", desc: "실제로 작동하는 첫 버전을 만든다" },
  { id: "04-upgrade", ko: "업그레이드", desc: "기능을 더하고 '내가 만든 느낌'이 나게 다듬는다" },
  { id: "05-demo-coach", ko: "데모 코치", desc: "3분 발표문과 시연 순서를 만든다" },
];

const tpl = (name) => readFileSync(join(root, "report-templates", name), "utf8").trim();

const preamble = tpl("interaction-preamble.md");
const debugBlock = tpl("debug-block.md");

const FOOTER_MARKER = "## 📤 마지막 단계";
const footerRaw = tpl("submission-footer.md");
const fi = footerRaw.indexOf(FOOTER_MARKER);
if (fi === -1) throw new Error("submission-footer.md 에서 footer 마커를 찾지 못함");
const footerTpl = footerRaw.slice(fi).trimEnd();

function handoffFor(i) {
  const next = STAGES[i + 1];
  if (!next) {
    return `오늘 ${STAGES.length}단계를 모두 마쳤어! 바탕화면 \`AI메이커데이\` 폴더에 보고서 ${STAGES.length}개가 다 모였는지 확인하고, 발표를 멋지게 해보자.`;
  }
  return `이제 다음은 **${next.ko}** 단계야 — ${next.desc}. 준비되면 다음 스킬 파일(\`${next.id}.md\`)을 **이 대화에 이어서** 넣어줘. 지금까지 정리한 내용을 그대로 이어받아 진행할게.`;
}

// 이전 단계 구성으로 만들어진 배포본이 남아있으면 지운다.
const keep = new Set(STAGES.map((s) => `${s.id}.md`));
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith(".md") && !keep.has(f)) {
    unlinkSync(join(OUT_DIR, f));
    console.log(`− ${f} (옛 단계 — 제거)`);
  }
}

STAGES.forEach((stage, i) => {
  let body = readFileSync(join(root, "skills", `${stage.id}.md`), "utf8").trim();

  if (body.includes("__DEBUG_BLOCK__")) {
    body = body.replaceAll("__DEBUG_BLOCK__", debugBlock);
  }
  if (!body.startsWith("# ")) throw new Error(`${stage.id}: H1 제목으로 시작하지 않음`);

  // H1 바로 아래에 공통 진행규칙 삽입
  const nl = body.indexOf("\n");
  const title = body.slice(0, nl);
  const rest = body.slice(nl + 1).replace(/^\n+/, "");

  const footer = footerTpl
    .replaceAll("__STAGE__", stage.id)
    .replaceAll("__HANDOFF__", handoffFor(i));

  const out = `${title}\n\n${preamble}\n\n${rest}\n\n---\n\n${footer}\n`;
  writeFileSync(join(OUT_DIR, `${stage.id}.md`), out, "utf8");
  console.log(`✓ ${stage.id}.md`);
});

console.log(`done — ${STAGES.length}단계`);
