interface Props {
  html: string;
  className?: string;
  title?: string;
}

// 학생이 제출한 HTML 보고서를 안전하게(스크립트 차단) 렌더한다.
// sandbox="" 이면 스크립트/폼/팝업이 모두 비활성화되고 CSS 스타일만 적용된다.
export default function ReportPreview({ html, className, title }: Props) {
  return (
    <iframe
      title={title || "보고서 미리보기"}
      srcDoc={html}
      sandbox=""
      className={
        className ||
        "w-full h-[70vh] rounded-xl border border-slate-700 bg-white"
      }
    />
  );
}
