/* macOS 스타일 손수 제작 SVG 아이콘 (이모지 아님).
   IconDefs 를 셸에 한 번 렌더하고, <Icon id="ic-home"/> 로 재사용한다. */

export function Icon({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}

export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        {/* 그라디언트 */}
        <linearGradient id="g-home" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fb8ff" /><stop offset="1" stopColor="#3a74e0" /></linearGradient>
        <linearGradient id="g-mat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5ee0a8" /><stop offset="1" stopColor="#12a37a" /></linearGradient>
        <linearGradient id="g-sub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c39bff" /><stop offset="1" stopColor="#7c4de0" /></linearGradient>
        <linearGradient id="g-dash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd36e" /><stop offset="1" stopColor="#f0883a" /></linearGradient>
        <linearGradient id="g-brand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fe6ff" /><stop offset="1" stopColor="#7c8cff" /></linearGradient>
        <linearGradient id="g-tophi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,.55)" /><stop offset="0.5" stopColor="rgba(255,255,255,.05)" /><stop offset="1" stopColor="rgba(255,255,255,0)" /></linearGradient>
        <linearGradient id="g-fback" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5ea8f2" /><stop offset="1" stopColor="#3d7fd6" /></linearGradient>
        <linearGradient id="g-ffront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9ad0ff" /><stop offset="1" stopColor="#5aa6f5" /></linearGradient>

        {/* 홈 */}
        <symbol id="ic-home" viewBox="0 0 120 120">
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-home)" />
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-tophi)" />
          <path d="M60 32 L92 58 L86 58 L86 88 Q86 90 84 90 L68 90 L68 70 L52 70 L52 90 L36 90 Q34 90 34 88 L34 58 L28 58 Z" fill="#fff" />
        </symbol>
        {/* 강의 자료 (책) */}
        <symbol id="ic-mat" viewBox="0 0 120 120">
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-mat)" />
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-tophi)" />
          <path d="M60 42 C51 35 38 35 30 40 L30 84 C38 79 51 79 60 86 C69 79 82 79 90 84 L90 40 C82 35 69 35 60 42 Z" fill="#fff" />
          <path d="M60 42 L60 86" stroke="rgba(18,163,122,0.35)" strokeWidth="2.5" />
        </symbol>
        {/* 결과 제출 (업로드) */}
        <symbol id="ic-sub" viewBox="0 0 120 120">
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-sub)" />
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-tophi)" />
          <path d="M60 34 L78 54 L67 54 L67 74 L53 74 L53 54 L42 54 Z" fill="#fff" />
          <path d="M36 66 L36 82 Q36 88 42 88 L78 88 Q84 88 84 82 L84 66" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" />
        </symbol>
        {/* 대시보드 (막대) */}
        <symbol id="ic-dash" viewBox="0 0 120 120">
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-dash)" />
          <rect x="8" y="8" width="104" height="104" rx="27" fill="url(#g-tophi)" />
          <rect x="34" y="62" width="13" height="26" rx="4" fill="#fff" />
          <rect x="53" y="46" width="13" height="42" rx="4" fill="#fff" />
          <rect x="72" y="54" width="13" height="34" rx="4" fill="#fff" />
        </symbol>
        {/* 폴더 */}
        <symbol id="ic-folder" viewBox="0 0 120 96">
          <path d="M14 22 h28 l10 10 h54 a10 10 0 0 1 10 10 v36 a10 10 0 0 1 -10 10 h-82 a10 10 0 0 1 -10 -10 v-56 a10 10 0 0 1 10 -10 z" fill="url(#g-fback)" />
          <path d="M8 40 h104 a8 8 0 0 1 7.8 9.9 l-7 32 a10 10 0 0 1 -9.8 8.1 h-84 a10 10 0 0 1 -9.8 -8.1 l-7 -32 a8 8 0 0 1 7.8 -9.9 z" fill="url(#g-ffront)" />
          <path d="M8 40 h104 a8 8 0 0 1 7.8 9.9 l-1 4.6 h-118 l-.6 -4.6 a8 8 0 0 1 7.8 -9.9 z" fill="rgba(255,255,255,0.28)" />
        </symbol>
        {/* 문서 */}
        <symbol id="ic-doc" viewBox="0 0 96 118">
          <path d="M16 6 h44 l24 24 v78 a8 8 0 0 1 -8 8 h-60 a8 8 0 0 1 -8 -8 v-94 a8 8 0 0 1 8 -8 z" fill="#fdfefe" />
          <path d="M60 6 v18 a6 6 0 0 0 6 6 h18 z" fill="#cdd3e0" />
          <rect x="28" y="40" width="34" height="7" rx="3.5" fill="#64d2ff" />
          <rect x="28" y="58" width="40" height="5" rx="2.5" fill="#c7ccd8" />
          <rect x="28" y="70" width="40" height="5" rx="2.5" fill="#c7ccd8" />
          <rect x="28" y="82" width="26" height="5" rx="2.5" fill="#c7ccd8" />
        </symbol>
        {/* 브랜드 스파클 */}
        <symbol id="ic-spark" viewBox="0 0 24 24">
          <path d="M12 2 L14 9.5 L21.5 12 L14 14.5 L12 22 L10 14.5 L2.5 12 L10 9.5 Z" fill="#fff" />
        </symbol>
        {/* 상태 글리프 */}
        <symbol id="ic-search" viewBox="0 0 20 20"><circle cx="9" cy="9" r="6" fill="none" stroke="#fff" strokeWidth="1.8" /><line x1="13.5" y1="13.5" x2="18" y2="18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></symbol>
        <symbol id="ic-wifi" viewBox="0 0 22 18"><path d="M2 6 Q11 -2 20 6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M5 9.5 Q11 4 17 9.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 13 Q11 10 14 13" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><circle cx="11" cy="15.5" r="1.4" fill="#fff" /></symbol>
        <symbol id="ic-batt" viewBox="0 0 28 16"><rect x="1" y="2.5" width="22" height="11" rx="3" fill="none" stroke="#fff" strokeWidth="1.6" /><rect x="24.5" y="6" width="2.5" height="4" rx="1.2" fill="#fff" /><rect x="3" y="4.5" width="16" height="7" rx="1.5" fill="#fff" /></symbol>
      </defs>
    </svg>
  );
}
