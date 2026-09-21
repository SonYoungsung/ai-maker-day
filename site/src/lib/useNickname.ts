import { useCallback, useEffect, useState } from "react";

const KEY = "ai-edu-nickname";

// 학생 닉네임을 브라우저에 한 번만 저장하고 모든 페이지에서 공유한다.
export function useNickname(): [string, (v: string) => void] {
  const [nickname, setNicknameState] = useState<string>(
    () => localStorage.getItem(KEY) || ""
  );

  const setNickname = useCallback((v: string) => {
    setNicknameState(v);
    localStorage.setItem(KEY, v);
  }, []);

  // 다른 탭에서 바뀌면 동기화
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) setNicknameState(e.newValue || "");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return [nickname, setNickname];
}
