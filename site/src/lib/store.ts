import { getSupabase, SESSION_CODE } from "./supabase";

// 제출 1건. Supabase 테이블 컬럼과 동일한 형태.
export interface Submission {
  id: string;
  created_at: string;
  student: string;
  stage: string;
  project: string | null;
  summary: string | null;
  payload: unknown;
  report_html: string;
  session_code: string | null;
}

export type NewSubmission = Omit<Submission, "id" | "created_at">;

const LOCAL_KEY = "ai-edu-submissions";
const TABLE = "submissions";

export function usingSupabase(): boolean {
  return getSupabase() !== null;
}

// ---- localStorage 폴백 구현 ----
function readLocal(): Submission[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Submission[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: Submission[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

// ---- 공개 API ----
export async function saveSubmission(input: NewSubmission): Promise<Submission> {
  const sb = getSupabase();
  const payload = { ...input, session_code: input.session_code ?? SESSION_CODE };

  if (sb) {
    const { data, error } = await sb.from(TABLE).insert(payload).select().single();
    if (error) throw error;
    return data as Submission;
  }

  const row: Submission = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const rows = readLocal();
  rows.unshift(row);
  writeLocal(rows);
  // 다른 탭(대시보드)에서 감지할 수 있도록 이벤트를 강제 발생시킨다.
  window.dispatchEvent(new StorageEvent("storage", { key: LOCAL_KEY }));
  return row;
}

export async function listSubmissions(): Promise<Submission[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Submission[];
  }
  return readLocal();
}

// 실시간 구독. 새 데이터가 들어오면 콜백 호출. 정리 함수를 반환한다.
export function subscribe(onChange: () => void): () => void {
  const sb = getSupabase();
  if (sb) {
    const channel = sb
      .channel("submissions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE },
        () => onChange()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }

  // 로컬 모드: 같은 탭 dispatch + 다른 탭 storage 이벤트 모두 처리
  const handler = (e: StorageEvent) => {
    if (!e.key || e.key === LOCAL_KEY) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
