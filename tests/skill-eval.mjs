// 스킬 회귀 테스트 워크플로 (Workflow 오케스트레이션)
// 가상 학생 페르소나 ↔ 코치(스킬 피험자)를 멀티턴으로 대화시키고,
// (1) 기계 검사(ONEDAY 유효성)와 (2) 심판 에이전트의 루브릭 채점을 수행한다.
//
// 실행: 메인 루프에서 스킬/페르소나/루브릭 파일을 Read해 args로 넘긴다.
//   Workflow({ scriptPath: "tests/skill-eval.mjs", args: {
//     stages: [{ id: "01-idea-coach", content: "<파일내용>" }, ...],  // 연속 순서대로
//     persona: { name: "eager-gamer", content: "<파일내용>" },
//     rubric: "<rubric.md 내용>",
//     maxExchanges: 6                                                  // 단계별 최대 왕복
//   }})
// 반환값을 메인 루프가 tests/reports/<날짜>-<페르소나>.md 로 저장한다.

export const meta = {
  name: 'skill-eval',
  description: '가상 학생 페르소나로 스킬을 대화 실행하고 루브릭으로 채점 (스킬 회귀 테스트)',
  phases: [
    { title: 'Dialogue', detail: '코치↔학생 멀티턴 대화 (단계 연속)' },
    { title: 'Judge', detail: '루브릭 기반 정성 채점' },
  ],
}

const A = args || {}
const stages = A.stages || []
const persona = A.persona || { name: 'unknown', content: '' }
const rubric = A.rubric || ''
const maxExchanges = A.maxExchanges || 6

if (!stages.length) {
  throw new Error('args.stages 가 비어 있음 — 메인 루프에서 스킬 파일 내용을 읽어 넘겨야 함')
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['criteria', 'regression', 'passCount', 'total', 'verdict', 'summary'],
  properties: {
    criteria: {
      type: 'array',
      description: '루브릭 기준별 채점 (11개)',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'pass', 'evidence', 'suggestion'],
        properties: {
          id: { type: 'string', description: '기준 번호 (예: A1, B5)' },
          name: { type: 'string' },
          pass: { type: 'boolean' },
          evidence: { type: 'string', description: '대화에서 인용한 근거' },
          suggestion: { type: 'string', description: '개선 제안 (pass여도 있으면 적음)' },
        },
      },
    },
    regression: {
      type: 'array',
      description: '핵심 회귀 신호(직행/반복/심화 부족) 중 fail 난 항목 요약',
      items: { type: 'string' },
    },
    passCount: { type: 'number' },
    total: { type: 'number' },
    verdict: { type: 'string', enum: ['PASS', 'NEEDS_WORK'] },
    summary: { type: 'string', description: '한 줄 총평' },
  },
}

// ONEDAY 보고서 기계 검사 (에이전트 무관, 결정적)
function checkReport(text, expectedStage) {
  const m = text.match(/<!--\s*ONEDAY\s*([\s\S]*?)-->/i)
  if (!m) return { found: false, reason: 'ONEDAY 주석 없음' }
  let meta
  try {
    meta = JSON.parse(m[1].trim())
  } catch (e) {
    return { found: true, jsonOk: false, reason: 'JSON 파싱 실패: ' + (e && e.message) }
  }
  const hasDoctype = /<!doctype html/i.test(text)
  return {
    found: true,
    jsonOk: true,
    stageMatch: meta.stage === expectedStage,
    noStudentField: !('student' in meta),
    hasDoctype,
    stage: meta.stage,
  }
}

let transcript = ''
const stageReports = []

phase('Dialogue')
for (let s = 0; s < stages.length; s++) {
  const stage = stages[s]
  transcript += `\n\n=== [학생이 이 대화에 스킬 파일 "${stage.id}.md" 를 붙여넣었다. 아래가 그 내용이다] ===\n${stage.content}\n=== [붙여넣기 끝 — 이제 이 스킬대로 진행하라] ===\n`

  let stageText = ''
  let completed = false
  for (let i = 0; i < maxExchanges && !completed; i++) {
    const coach = await agent(
      `너는 Claude 데스크탑 앱에서, 학생이 방금 붙여넣은 스킬 프롬프트대로 행동하는 코치다.\n` +
      `아래는 지금까지의 대화 전체다(이전 단계 포함 — 반드시 맥락을 이어라):\n<대화>\n${transcript}\n</대화>\n\n` +
      `지시:\n` +
      `- 학생의 마지막 메시지에 이어 **코치로서 다음 한 번의 발화만** 출력한다. 여러 턴을 미리 쓰지 마라.\n` +
      `- 스킬의 "진행 방식" 규칙을 지켜라: 한 번에 한 질문, 곧바로 보고서 직행 금지, 앞 단계 정보는 되묻지 말고 짧게 확인, 단계마다 더 구체적으로.\n` +
      `- 이 단계의 질답이 충분히 끝나 **최종 HTML 보고서**까지 만들고, 학생의 확인/수정 반영과 다음 단계 안내를 모두 마쳤다면:\n` +
      `    (a) 그 발화에 **완성된 HTML 전체**(맨 위 <!--ONEDAY ...--> 주석 포함)를 그대로 포함하고,\n` +
      `    (b) 발화 맨 끝에 정확히 [[STAGE_COMPLETE]] 를 붙여라.\n` +
      `  아직 대화 중이면 [[STAGE_COMPLETE]] 를 절대 붙이지 마라.`,
      { label: `coach:${stage.id}:${i}`, phase: 'Dialogue' }
    )
    transcript += `\n[코치] ${coach}\n`
    stageText += '\n' + coach

    if (coach.includes('[[STAGE_COMPLETE]]')) { completed = true; break }

    const student = await agent(
      `너는 원데이 AI 클래스의 학생이다. 아래 페르소나를 그대로 연기한다:\n<페르소나>\n${persona.content}\n</페르소나>\n\n` +
      `아래는 지금까지의 대화다:\n<대화>\n${transcript}\n</대화>\n\n` +
      `코치의 마지막 발화(특히 질문)에 **학생으로서 짧고 현실적으로 한 번만** 답하라. ` +
      `개발/기술 용어는 모른다. 절대 코치 역할을 하거나 보고서를 만들지 마라. 학생 대사만 출력하라.`,
      { label: `student:${stage.id}:${i}`, phase: 'Dialogue' }
    )
    transcript += `\n[학생] ${student}\n`
  }

  stageReports.push({
    stage: stage.id,
    completed,
    report: checkReport(stageText, stage.id),
  })
  log(`${stage.id}: ${completed ? '완료' : `미완(maxExchanges=${maxExchanges} 도달)`}`)
}

phase('Judge')
const verdict = await agent(
  `너는 프롬프트(스킬) 대화 품질 심판이다. 아래 루브릭 기준으로, 이어지는 전체 대화 transcript를 채점하라.\n` +
  `<루브릭>\n${rubric}\n</루브릭>\n\n` +
  `<대화>\n${transcript}\n</대화>\n\n` +
  `각 기준(A1~D11)마다 pass/fail·근거 인용·개선 제안을 남기고, 직행(A2)·반복(B5)·심화부족(B7) 중 fail은 회귀로 표시하라. ` +
  `passCount/total(11)과 PASS 또는 NEEDS_WORK 판정, 한 줄 총평을 내라.`,
  { label: 'judge', phase: 'Judge', schema: VERDICT_SCHEMA }
)

return { persona: persona.name, stages: stageReports, verdict, transcript }
