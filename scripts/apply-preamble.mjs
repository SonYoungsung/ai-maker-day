// interaction-preamble.md(공통 "진행 방식" 규칙)를 site/public/skills/*.md 8개의
// H1 제목 바로 아래에 삽입한다. 이미 삽입돼 있으면 그 블록을 교체한다(idempotent).
// 각 스킬이 앞 단계 맥락이 있어도 곧바로 보고서로 직행하지 않고, 학생과 질답하며
// 진행하도록 강제하는 것이 목적이다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARK = "## ⚠️ 진행 방식";

const preamble = readFileSync(join(root, "report-templates/interaction-preamble.md"), "utf8").trim();

const files = [
  "01-idea-coach",
  "02-project-planner",
  "03-ux-designer",
  "04-coding-partner",
  "05-debugging-coach",
  "06-feature-builder",
  "07-design-coach",
  "08-demo-coach",
];

for (const id of files) {
  const path = join(root, "site/public/skills", `${id}.md`);
  let c = readFileSync(path, "utf8");

  // 기존 preamble 있으면 제거 (MARK ~ 다음 최상위 헤딩 직전)
  const mi = c.indexOf(MARK);
  if (mi !== -1) {
    const after = c.indexOf("\n## ", mi + MARK.length);
    if (after === -1) throw new Error(`${id}: preamble 다음 섹션을 못 찾음`);
    c = c.slice(0, mi) + c.slice(after + 1); // 다음 헤딩은 유지
  }

  // H1 제목(첫 줄) 바로 아래에 삽입
  const nl = c.indexOf("\n");
  if (nl === -1 || !c.startsWith("# ")) throw new Error(`${id}: H1 제목을 못 찾음`);
  const title = c.slice(0, nl);
  const rest = c.slice(nl + 1).replace(/^\n+/, "");
  writeFileSync(path, `${title}\n\n${preamble}\n\n${rest}`, "utf8");
  console.log(`✓ ${id}.md`);
}
console.log("done");
