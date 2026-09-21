# AI 메이커데이 — 프로젝트 안내 (Claude 자동 로드)

> **작업을 시작하기 전에 반드시 이 폴더의 `CONTEXT.md`를 먼저 읽는다.**
> 설계 배경·현재 상태·남은 일·파일 지도·보안 제약이 모두 거기 있다.

## 한눈 요약

- **프로젝트**: 중·고등학생 원데이 AI 클래스 웹사이트 — (1) 스킬 8종 배포 + (2) 학생 HTML 보고서 수집/실시간 대시보드.
- **핵심 트릭**: HTML 한 파일이 보이는 보고서 + 숨은 제출 데이터(`<!--ONEDAY ...-->`)를 동시에 담는다. 파싱은 `site/src/lib/parse.ts`.
- **스택**: Vite + React + TS + Tailwind v4 + Supabase (`site/`), React Router HashRouter.
- **repo**: https://github.com/SonYoungsung/ai-maker-day (독립 git repo — 홈 디렉터리 안에 있으니 `git status`로 위치 먼저 확인).
- **실행**: `cd site && npm install && npm run dev` → http://localhost:5173

## 규칙

- 파일 삭제는 `rm` 금지 → **`trash`** 사용.
- **service_role 키 커밋/노출 금지.** 클라이언트엔 publishable(anon) 키만. `site/.env`는 gitignored.
- 사이트 변경은 `npm run dev` 육안 확인까지.

자세한 내용은 → **`CONTEXT.md`**, 파일 시스템 저장 흐름은 → **`docs/filesystem-connector.md`**.
