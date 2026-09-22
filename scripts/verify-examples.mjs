import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "report-templates", "examples");
const ONEDAY_RE = /<!--\s*ONEDAY\s*([\s\S]*?)-->/i;
let ok = 0, bad = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith(".html")).sort()) {
  const html = readFileSync(join(dir, f), "utf8");
  const m = html.match(ONEDAY_RE);
  if (!m) { console.log(`✗ ${f}: ONEDAY 주석 없음`); bad++; continue; }
  try {
    const meta = JSON.parse(m[1].trim());
    const stage = f.replace(/\.html$/, "");
    const stageOk = meta.stage === stage;
    const hasDoc = /<!doctype html/i.test(html);
    // 닉네임은 제출 사이트에서 받는다 → 보고서에는 이름이 들어가면 안 된다
    // (report-templates/submission-footer.md 규칙)
    const noStudent = meta.student === undefined;
    const keys = Object.keys(meta.payload || {}).length;
    const pass = stageOk && hasDoc && noStudent;
    const notes = [
      stageOk ? "" : " (파일명불일치!)",
      noStudent ? "" : ` (student 필드 있음: ${meta.student})`,
    ].join("");
    console.log(`${pass ? "✓" : "✗"} ${f}  stage=${meta.stage}${notes}  payloadKeys=${keys}  doctype=${hasDoc}`);
    if (pass) ok++; else bad++;
  } catch (e) { console.log(`✗ ${f}: JSON 파싱 실패 — ${e.message}`); bad++; }
}
console.log(`\n결과: ${ok} OK / ${bad} 실패`);
if (bad) process.exit(1);
