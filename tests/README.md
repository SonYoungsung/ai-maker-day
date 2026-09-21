# 스킬 회귀 테스트 (skill eval)

스킬(프롬프트)을 고칠 때마다, **가상 학생 페르소나**가 그 스킬로 실제 대화를 해보고, 우리가 정한 대화 품질 기준(`rubric.md`)을 지키는지 자동 채점한다. "곧바로 보고서 직행", "질문 반복", "심화 부족" 같은 회귀를 사람이 매번 손으로 안 돌려도 잡아낸다.

## 구성

```
tests/
├── personas/           # 학생 페르소나 3종 (eager-gamer / vague-explorer / distracted-social)
├── rubric.md           # 채점 기준 11항목 (단일 출처)
├── skill-eval.mjs      # Workflow 오케스트레이션 스크립트 (코치↔학생 루프 + 기계검사 + 심판)
├── reports/            # 실행 결과 (회귀 추적용)
└── README.md           # (이 파일)
```

## 어떻게 돌아가나

`skill-eval.mjs` = Claude Code **Workflow**. 3개 역할이 협업한다.

1. **코치 에이전트** — 학생이 "붙여넣은" 스킬 내용대로 코치로 응답 (한 턴씩).
2. **학생 에이전트** — 지정 페르소나를 연기하며 짧고 현실적으로 답 (한 턴씩).
3. **심판 에이전트** — 끝난 뒤 전체 대화를 `rubric.md`로 채점 (구조화 출력).

단계(stage)를 **연속으로** 이어 붙여, 이전 단계 맥락이 유지되는지 + 반복 없이 심화되는지까지 본다.
매 단계 끝에는 **기계 검사**(에이전트 무관)로 ONEDAY 유효성(주석·JSON·stage 일치·`student` 키 없음·`<!doctype html>`)을 확인한다.

## 실행 (Claude가 대신 돌림)

스킬을 고친 뒤 **"이번 변경 스킬 테스트해줘"** 라고 하면 Claude가:

1. 대상 스킬 `.md`들 + 페르소나 + `rubric.md`를 **Read**로 읽어
2. `Workflow({ scriptPath: "tests/skill-eval.mjs", args: {...} })` 로 실행하고
3. 반환값을 `tests/reports/<날짜>-<페르소나>.md` 로 저장한다.

`args` 형태:
```js
{
  stages: [ { id: "01-idea-coach", content: "<01 파일 내용>" },
            { id: "02-project-planner", content: "<02 파일 내용>" }, ... ], // 연속 순서
  persona: { name: "eager-gamer", content: "<페르소나 파일 내용>" },
  rubric: "<rubric.md 내용>",
  maxExchanges: 6   // 단계별 최대 왕복 수
}
```

- **스모크(기본)**: `stages = 01~03`, `persona = eager-gamer`, `maxExchanges = 6`.
  가장 회귀가 잘 나는 초반 3단계(아이디어→플래너→UX)를 1페르소나로 빠르게 검증.
- **풀**: `stages = 01~08`, 페르소나 3종 각각. 큰 변경 전후에.

> 비용: 연속 실행은 코치↔학생이 순차로 여러 왕복 → 에이전트 호출이 수십 회. `maxExchanges`와 stage 수로 조절한다. 다중 에이전트라 토큰을 꽤 쓴다.

## 결과(리포트) 읽는 법

- **핵심 회귀 신호**: `A2 직행` / `B5 반복` / `B7 심화부족` 중 fail이 있으면 그 변경이 대화 품질을 깼다는 뜻.
- 기계 검사에서 `stageMatch=false`나 `noStudentField=false`면 ONEDAY 포맷 회귀.
- `verdict: NEEDS_WORK` 면 스킬을 다시 손봐야 한다. 리포트의 개선 제안을 반영 → 재실행.

## 확장

- 페르소나 추가: `personas/`에 `.md` 하나 더 (연기 규칙 형식 동일).
- 기준 변경: `rubric.md`만 고치면 심판이 자동 반영.
