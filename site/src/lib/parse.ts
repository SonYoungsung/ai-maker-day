// 학생이 제출한 HTML 보고서에서 숨은 제출 데이터(<!--ONEDAY ... -->)를 파싱한다.
// 스킬이 만들어주는 HTML 보고서 맨 위에는 아래 형식의 주석이 들어 있다:
//
//   <!--ONEDAY
//   {"student":"닉네임","stage":"01-idea-coach","project":"...","summary":"...","payload":{...}}
//   -->
//
// 이 주석 하나로 (1) 화면에 보이는 예쁜 보고서와 (2) 구조화된 제출 데이터를
// 한 파일에 담는다.

export interface OnedayMeta {
  student?: string;
  stage?: string;
  project?: string;
  summary?: string;
  payload?: unknown;
  [key: string]: unknown;
}

export interface ParsedReport {
  html: string; // 원본 HTML 전체
  meta: OnedayMeta | null; // 파싱된 ONEDAY 데이터 (없으면 null)
  isHtmlDoc: boolean; // <html> / <!doctype> 를 포함한 문서로 보이는가
  parseError: string | null; // ONEDAY 주석은 있으나 JSON 파싱 실패 시 메시지
}

const ONEDAY_RE = /<!--\s*ONEDAY\s*([\s\S]*?)-->/i;

export function parseReport(input: string): ParsedReport {
  const html = input.trim();
  const isHtmlDoc = /<!doctype html|<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);

  const match = html.match(ONEDAY_RE);
  if (!match) {
    return { html, meta: null, isHtmlDoc, parseError: null };
  }

  const jsonText = match[1].trim();
  try {
    const meta = JSON.parse(jsonText) as OnedayMeta;
    return { html, meta, isHtmlDoc, parseError: null };
  } catch (e) {
    return {
      html,
      meta: null,
      isHtmlDoc,
      parseError: `제출 데이터(ONEDAY 블록)를 읽지 못했습니다: ${
        e instanceof Error ? e.message : String(e)
      }`,
    };
  }
}

// 제출 데이터에서 대표 요약 텍스트를 안전하게 뽑아낸다.
export function metaSummary(meta: OnedayMeta | null): string {
  if (!meta) return "";
  if (typeof meta.summary === "string" && meta.summary) return meta.summary;
  if (typeof meta.project === "string" && meta.project) return meta.project;
  return "";
}
