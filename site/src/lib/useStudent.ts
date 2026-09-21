import { useCallback, useEffect, useRef, useState } from "react";
import {
  registerStudent,
  findStudentByNickname,
  type RegisterResult,
} from "./store";

// 학생 정체성. 닉네임 = 유일 유저 키.
// 한 번 클레임하면 localStorage(nickname + studentId)에 남아 재접속 시 자동 로그인된다.
const NICK = "ai-edu-nickname";
const SID = "ai-edu-student-id";

export type IdentityStatus = "loading" | "anonymous" | "ready" | "conflict";

export interface Identity {
  nickname: string;
  studentId: string | null;
  status: IdentityStatus;
  /** 새 닉네임을 등록(클레임). 성공하면 자동 로그인. taken/error 는 호출측이 안내. */
  claim: (nickname: string) => Promise<RegisterResult>;
  /** 정체성 초기화(다른 닉네임으로 다시 시작). DB 레코드는 지우지 않는다. */
  reset: () => void;
}

function initialStatus(): IdentityStatus {
  const n = localStorage.getItem(NICK);
  const s = localStorage.getItem(SID);
  if (n && s) return "ready";
  if (n && !s) return "loading";
  return "anonymous";
}

export function useStudent(): Identity {
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICK) || "");
  const [studentId, setStudentId] = useState<string | null>(
    () => localStorage.getItem(SID)
  );
  const [status, setStatus] = useState<IdentityStatus>(initialStatus);
  const resolved = useRef(false);

  // 마운트 시 정체성 해석: 닉네임은 있으나 studentId 가 없을 때
  // (구버전 localStorage, 혹은 로컬→Supabase 전환) DB에서 찾거나 새로 클레임한다.
  useEffect(() => {
    if (resolved.current) return;
    resolved.current = true;

    const n = localStorage.getItem(NICK);
    const s = localStorage.getItem(SID);
    if (n && s) {
      setStatus("ready");
      return;
    }
    if (!n) {
      setStatus("anonymous");
      return;
    }
    // 닉네임만 있는 경우
    (async () => {
      const found = await findStudentByNickname(n);
      if (found) {
        localStorage.setItem(SID, found.id);
        setStudentId(found.id);
        setStatus("ready");
        return;
      }
      const res = await registerStudent(n);
      if (res.status === "ok") {
        localStorage.setItem(SID, res.student.id);
        setStudentId(res.student.id);
        setStatus("ready");
      } else {
        // 누군가 이미 그 닉네임을 쓰고 있음(taken) 또는 오류 → 다시 고르게 한다.
        setStatus("conflict");
      }
    })();
  }, []);

  const claim = useCallback(async (raw: string): Promise<RegisterResult> => {
    const res = await registerStudent(raw);
    if (res.status === "ok") {
      localStorage.setItem(NICK, res.student.nickname);
      localStorage.setItem(SID, res.student.id);
      setNickname(res.student.nickname);
      setStudentId(res.student.id);
      setStatus("ready");
    }
    return res;
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(NICK);
    localStorage.removeItem(SID);
    setNickname("");
    setStudentId(null);
    setStatus("anonymous");
  }, []);

  // 다른 탭에서 클레임/초기화하면 동기화
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === NICK || e.key === SID || e.key === null) {
        const n = localStorage.getItem(NICK) || "";
        const sid = localStorage.getItem(SID);
        setNickname(n);
        setStudentId(sid);
        setStatus(n && sid ? "ready" : n ? "loading" : "anonymous");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { nickname, studentId, status, claim, reset };
}
