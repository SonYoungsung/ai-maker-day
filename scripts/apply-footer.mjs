// submission-footer.md의 새 footer를 site/public/skills/*.md 8개에 반영한다.
// 각 파일의 기존 '## 📤 마지막 단계' 블록을 잘라내고, __STAGE__를 해당 stage id로
// 치환한 새 footer로 교체한다. 스킬 본문(그 앞부분)은 그대로 유지된다.
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

const stages = [
  "01-idea-coach",
  "02-project-planner",
  "03-ux-designer",
  "04-coding-partner",
  "05-debugging-coach",
  "06-feature-builder",
  "07-design-coach",
  "08-demo-coach",
];

for (const stage of stages) {
  const path = join(root, "site/public/skills", `${stage}.md`);
  const content = readFileSync(path, "utf8");
  const idx = content.indexOf(MARKER);
  if (idx === -1) throw new Error(`${stage}: 기존 footer 마커 없음`);

  // footer 앞 본문에서 끝의 '---' 구분선/공백 제거
  let body = content.slice(0, idx).replace(/\n*-{3,}\s*$/g, "").trimEnd();
  const footer = footerTpl.replaceAll("__STAGE__", stage);
  const out = `${body}\n\n---\n\n${footer}\n`;
  writeFileSync(path, out, "utf8");
  console.log(`✓ ${stage}.md`);
}
console.log("done");
