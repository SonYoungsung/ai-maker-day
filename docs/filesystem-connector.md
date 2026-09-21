# 파일 시스템 접근 — 작동 원리 & 학생 사용 흐름

원데이 AI 클래스에서 스킬 마지막 단계는 완성한 HTML 보고서를 학생 컴퓨터 **바탕화면 `AI메이커데이` 폴더**에 저장한다. 이 문서는 그게 기술적으로 어떻게 가능한지, 학생이 실제로 어떻게 쓰게 되는지, 강사가 실습 PC를 어떻게 준비하면 되는지를 정리한다.

---

## 0. 용어 먼저 (헷갈리기 쉬움)

Claude 데스크탑이 외부와 연결되는 방식은 **두 종류**이고, 로컬 파일 저장에 필요한 건 **Extension** 쪽이다.

| | **Connector (커넥터)** | **Extension (확장)** ← 우리가 쓰는 것 |
|---|---|---|
| 대상 | Gmail, Google Drive 등 **원격 서비스** | 내 컴퓨터의 **로컬 파일/앱** |
| 실행 위치 | Anthropic 서버 경유(원격) | **내 컴퓨터에서 로컬 실행** |
| 파일 저장 | ❌ 로컬 디스크에 못 씀 | ✅ 지정한 폴더에 읽기/쓰기 |
| 사용 환경 | 웹·데스크탑·모바일 | **데스크탑 앱 / Claude Code 전용** |

> 그래서 "바탕화면에 저장"을 하려면 **Filesystem Extension**(내부적으로는 로컬 MCP 서버)을 켜야 한다. 원격 "커넥터"로는 안 된다.

## 1. 작동 원리 (한 문단)

**MCP(Model Context Protocol)** 는 Claude에게 "도구"를 쥐여주는 표준 다리다. **Filesystem Extension** 을 설치하면, Claude에게 "지정한 폴더 안에서 파일을 읽기/쓰기/생성/이동하는 도구"가 생긴다. 이 서버는 **내 컴퓨터에서 로컬로 실행**되고, **허용한 폴더 밖은 건드릴 수 없으며**, 연결만으로 어디에 업로드되는 것도 아니다. 즉 Claude가 대화 중에 "이 HTML을 `~/Desktop/AI메이커데이/01-idea-coach.html`로 저장할게" 하면서 실제 `write_file` 도구를 호출해 디스크에 파일을 만드는 것이다.

## 2. 설정 방법

### 방법 A — Browse Extensions (권장, 클릭 몇 번, 모든 요금제·무료 포함)

1. Claude 데스크탑 → 좌하단 **Settings**(또는 `Ctrl/Cmd + ,`).
2. 왼쪽 사이드바 **Browse Extensions**.
3. **Filesystem** 찾아 **+** → 우상단 **Install** → 팝업 **Install** 확인.
4. **+ Add directory** 로 접근 허용 폴더 지정 → **바탕화면(Desktop)** 을 선택(그래야 Claude가 그 안에 `AI메이커데이` 폴더를 새로 만들 수 있다).
5. **Save** → 창 닫고 채팅으로 복귀.

이후 채팅 입력창 근처 **망치(도구) 아이콘**에 파일 도구가 보이면 준비 완료.

### 방법 B — 수동 설정 (JSON, 개발자/강사용)

1. Settings → **Developer** 탭 → **Edit Config** (→ `claude_desktop_config.json` 열림).
2. `filesystem` MCP 서버를 등록하고 `args` 배열에 허용 폴더의 **절대 경로**를 넣는다. (이 방식은 **Node.js** 가 설치돼 있어야 함.)
   ```json
   {
     "mcpServers": {
       "filesystem": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/<이름>/Desktop"]
       }
     }
   }
   ```
3. 저장 후 Claude 데스크탑 **완전 종료 후 재시작**(MCP 서버 로드에 필요).
4. 망치 아이콘에 도구가 뜨는지 확인.

> 비개발 학생에게는 **방법 A** 만 쓴다. 방법 B는 강사가 실습 PC를 세팅할 때 옵션.

## 3. 학생이 실제로 겪는 흐름

**전제:** 방법 A로 Filesystem Extension이 켜져 있고, 허용 폴더 = 바탕화면.

1. 사이트 **강의자료**에서 스킬(예: `01-idea-coach`)을 복사 → Claude 데스크탑 새 대화에 붙여넣기.
2. Claude와 대화하며 아이디어/설계/코딩… 각 단계를 진행. (질문에 답만 하면 됨)
3. 마지막 단계에서 Claude가 완성 HTML 보고서를 만들고 **"바탕화면 `AI메이커데이` 폴더에 `01-idea-coach.html`로 저장할게"** 라고 말하며 저장 도구를 호출.
4. **권한 팝업**이 뜸 → 학생이 **Allow(허용)** 클릭. (반복이 귀찮으면 "이 채팅에서 항상 허용" 선택)
5. `~/Desktop/AI메이커데이/01-idea-coach.html` 생성 완료. Claude가 저장 경로를 알려줌.
6. "이 부분 바꿔줘"로 다듬으면 **같은 파일을 덮어쓰기**.
7. 하루 동안 8단계를 진행하면 그 폴더에 `01~08.html` 8개가 쌓임.
8. QR로 연 **제출 사이트 → 결과 제출**에서 그 폴더의 파일을 업로드/붙여넣기 → 미리보기 → 제출.

## 4. 폴백 — 파일 시스템 접근이 없을 때

Extension을 못 켜는 환경(권한 없는 PC, 설정 어려움 등)에서는 스킬이 자동으로 이렇게 안내한다:

1. Claude가 완성 HTML을 **코드블록 / 다운로드**로 제공.
2. 학생이 **바탕화면에 `AI메이커데이` 폴더를 직접 만들고**, 받은 파일을 `<단계>.html`(예: `01-idea-coach.html`) 이름으로 그 안에 저장.
3. 이후 제출 흐름은 동일.

즉, **Extension이 있으면 자동 저장, 없으면 다운로드-저장** — 어느 쪽이든 최종적으로 같은 폴더/파일명 규칙으로 수렴한다.

## 5. 강사 준비 체크리스트 (실습 PC)

- [ ] 각 PC의 Claude 데스크탑에 **Filesystem Extension 설치**(방법 A).
- [ ] 허용 폴더 = **바탕화면(Desktop)** 지정. (또는 미리 `~/Desktop/AI메이커데이` 폴더를 만들어두고 그 폴더를 허용)
- [ ] 권한 팝업에서 학생이 당황하지 않게, 첫 저장 시 **"항상 허용"** 안내.
- [ ] 접근 못 켜는 PC는 **폴백(다운로드-저장)** 으로 진행해도 수업에 지장 없음을 공지.
- [ ] (선택) 방법 B로 세팅한다면 Node.js 설치 + JSON 경로가 각 PC 사용자명에 맞는지 확인.

## 6. 보안·프라이버시

- 접근은 **허용한 폴더 안으로만** 제한된다. 밖은 못 읽고 못 쓴다.
- **로컬에서만** 동작 — 연결한다고 파일이 어디로 업로드되지 않는다.
- 서버는 **내 계정 권한**으로 도니, 민감한 폴더(문서 전체, 시스템 폴더)는 허용하지 말고 **바탕화면(또는 전용 폴더)만** 지정.

---

### 참고 (출처)

- [Desktop and filesystem access — Claude Docs](https://claude.com/docs/third-party/claude-desktop/local-access)
- [When to use desktop and web connectors — Claude Help Center](https://support.claude.com/en/articles/11725091-when-to-use-desktop-and-web-connectors)
- [Connect to local MCP servers — Model Context Protocol](https://modelcontextprotocol.io/docs/2026-07-28/develop/connect-local-servers)
- [Can Claude Desktop Access Local Files? — StashBase](https://stashbase.ai/blog/can-claude-desktop-access-local-files/)
