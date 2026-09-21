import { getSupabase, SESSION_CODE } from "./supabase";

// 제출 1건. Supabase 테이블 컬럼과 동일한 형태.
export interface Submission {
  id: string;
  created_at: string;
  class_date: string; // "수업 날짜"(YYYY-MM-DD, Asia/Seoul). 서버 기본값이 채운다.
  student_id: string | null; // students.id (유저 키). 없을 수 있음(구 데이터).
  student: string; // 닉네임(비정규화 — 표시/하위호환용)
  stage: string;
  project: string | null;
  summary: string | null;
  payload: unknown;
  report_html: string;
  session_code: string | null;
}

// 제출 생성 시 클라이언트가 넣는 값. id/created_at 은 물론, class_date 도
// 서버 기본값(서울 오늘)이 채우므로 클라이언트는 보내지 않는다.
export type NewSubmission = Omit<Submission, "id" | "created_at" | "class_date">;

// 학생(유저) 1명. 닉네임이 유일 키.
export interface Student {
  id: string;
  nickname: string;
  created_at: string;
}

export type RegisterResult =
  | { status: "ok"; student: Student }
  | { status: "taken" }
  | { status: "error"; message: string };

const LOCAL_KEY = "ai-edu-submissions";
const LOCAL_STUDENTS = "ai-edu-students";
const TABLE = "submissions";
const STUDENTS = "students";

export function usingSupabase(): boolean {
  return getSupabase() !== null;
}

// "수업 날짜" = Asia/Seoul 기준 오늘 (YYYY-MM-DD). 로컬 모드에서 사용.
function seoulToday(): string {
  // en-CA 로케일은 YYYY-MM-DD 형식으로 포맷된다.
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// ---- localStorage 폴백: 제출 ----
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

// ---- localStorage 폴백: 학생 ----
function readLocalStudents(): Student[] {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS);
    return raw ? (JSON.parse(raw) as Student[]) : [];
  } catch {
    return [];
  }
}
function writeLocalStudents(rows: Student[]): void {
  localStorage.setItem(LOCAL_STUDENTS, JSON.stringify(rows));
}

// ============================================================
// 학생(유저) API — 닉네임 = 유일 키
// ============================================================

// 닉네임을 새로 등록(클레임)한다. 이미 있으면 { status: "taken" }.
export async function registerStudent(nickname: string): Promise<RegisterResult> {
  const name = nickname.trim();
  if (!name) return { status: "error", message: "닉네임을 입력해 주세요." };

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from(STUDENTS).insert({ nickname: name }).select().single();
    if (error) {
      // 23505 = unique_violation → 이미 사용 중인 닉네임
      if ((error as { code?: string }).code === "23505") return { status: "taken" };
      return { status: "error", message: error.message };
    }
    return { status: "ok", student: data as Student };
  }

  // 로컬 모드
  const rows = readLocalStudents();
  if (rows.some((s) => s.nickname.toLowerCase() === name.toLowerCase())) {
    return { status: "taken" };
  }
  const student: Student = {
    id: crypto.randomUUID(),
    nickname: name,
    created_at: new Date().toISOString(),
  };
  rows.push(student);
  writeLocalStudents(rows);
  return { status: "ok", student };
}

// 닉네임으로 학생을 찾는다(대소문자 무시). 재접속/마이그레이션 해석용.
export async function findStudentByNickname(nickname: string): Promise<Student | null> {
  const name = nickname.trim();
  if (!name) return null;

  const sb = getSupabase();
  if (sb) {
    // ilike(와일드카드 없이) = 대소문자 무시 일치. 만일의 % _ 오탐은 아래에서 정확 비교로 거른다.
    const { data, error } = await sb.from(STUDENTS).select("*").ilike("nickname", name).limit(5);
    if (error || !data) return null;
    return (
      (data as Student[]).find((s) => s.nickname.toLowerCase() === name.toLowerCase()) ?? null
    );
  }

  return (
    readLocalStudents().find((s) => s.nickname.toLowerCase() === name.toLowerCase()) ?? null
  );
}

// ============================================================
// 제출 API
// ============================================================
export async function saveSubmission(input: NewSubmission): Promise<Submission> {
  const sb = getSupabase();
  const payload = { ...input, session_code: input.session_code ?? SESSION_CODE };

  if (sb) {
    // class_date 는 넣지 않는다 → DB 기본값(서울 오늘)이 채운다.
    const { data, error } = await sb.from(TABLE).insert(payload).select().single();
    if (error) throw error;
    return data as Submission;
  }

  const row: Submission = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    class_date: seoulToday(),
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
