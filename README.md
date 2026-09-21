# 원데이 AI 클래스 — 자료 배포 + 결과 수집 사이트

중·고등학생 대상 원데이 AI 클래스를 위한 웹사이트입니다. 두 가지 역할을 합니다.

1. **강의 자료 배포** — 단계별 스킬(프롬프트)을 학생이 복사/다운로드해서 Claude 데스크탑 앱에 붙여넣고 사용
2. **결과물 수집** — 학생이 Claude로 만든 **HTML 보고서**를 제출 → 강사 대시보드에서 실시간 확인 + 강의 후 데이터로 활용

## 핵심 아이디어: 보고서 한 파일에 데이터를 심는다

각 스킬은 마지막에 학생이 다듬은 **HTML 보고서**를 만들어 줍니다. 그 HTML 맨 위에는 사람 눈에는 안 보이는 제출 데이터가 주석으로 들어 있습니다.

```html
<!--ONEDAY
{"student":"닉네임","stage":"01-idea-coach","project":"...","summary":"...","payload":{}}
-->
<!DOCTYPE html> ... 예쁜 보고서 ...
```

학생은 이 HTML 하나만 제출하면 됩니다. 사이트는 그걸 (1) 그대로 렌더해 보여주고 (2) 숨은 주석을 파싱해 구조화된 데이터로 저장합니다.

## 학생 흐름

```
Claude 데스크탑에서 스킬 사용 → 결과 + HTML 보고서(아티팩트) 생성
  → "이 부분 바꿔줘"로 계속 다듬기
  → 최종 HTML 복사/다운로드
QR로 연 사이트 → [결과 제출] → HTML 붙여넣기/업로드 → 미리보기 → 제출
  → 강사 [대시보드]에 실시간 반영 + 강의 후 데이터셋
```

## 폴더 구조

```
AI-edu/
├── site/                  # 웹 (Vite + React + TS + Tailwind + Supabase)
│   ├── src/pages/         # 홈 / 강의자료 / 결과제출 / 대시보드
│   ├── src/lib/           # skills, parse(ONEDAY), store(supabase|local)
│   └── public/skills/     # 배포되는 스킬 8종 (.md, 제출블록 포함)
├── skills/                # (원본 참고용 — 배포본은 site/public/skills)
├── report-templates/      # 제출 보고서 형식 안내 + 예시 HTML
└── supabase/              # DB 스키마 + RLS
```

## 실행

```bash
cd site
npm install
npm run dev          # http://localhost:5173
```

Supabase 없이도 바로 동작합니다(브라우저 localStorage 저장 = **로컬 모드**). 여러 학생 수집 + 실시간 대시보드를 쓰려면 아래를 연결하세요.

## Supabase 연결

1. Supabase 프로젝트 생성 후 `supabase/schema.sql`을 SQL Editor에서 실행
2. `site/.env.example`을 `site/.env`로 복사하고 값 입력:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

3. `npm run dev` 재시작 → 우측 상단 배지가 **실시간(초록)** 으로 바뀜

> anon 키는 프론트엔드에 공개돼도 됩니다(RLS로 보호). 단 기본 정책은 "제출물이 서로 보이는 오픈 수업"을 전제로 하니, 비공개가 필요하면 `schema.sql`의 select 정책을 강사 인증으로 좁히세요.

## GitHub Pages 배포 (추후)

1. 이 폴더를 GitHub 저장소로 push
2. `site/vite.config.ts`의 `base`를 저장소 경로에 맞게 조정 (예: `/ai-edu/`)
3. `cd site && npm run build` → `dist/`를 Pages로 배포 (또는 Actions/Vercel 연동)

## 미성년자 데이터 유의

- 실명 대신 **닉네임**으로 수집합니다.
- 결과물이 교육 개선용으로 저장된다는 안내를 사전에 하세요.
