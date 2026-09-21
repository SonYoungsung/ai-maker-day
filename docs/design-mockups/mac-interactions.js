/* ============================================================
   mac-interactions.js
   원데이 AI 클래스 — 글래스 목업 공통 인터랙션 토킷
   "맥북에서 실제 요소를 건드는 느낌"을 만드는 자바스크립트.
   모든 시안(concept-1/2/3)이 이 파일 하나를 공유한다.
   요소가 없으면 조용히 건너뛰므로 세 시안 어디서 불러도 안전.
   ============================================================ */
(() => {
  "use strict";

  /* -------------------------------------------------------
     1) 글래스 표면 커서 추적 스페큘러 하이라이트
     .glass 요소 위에서 커서를 따라 빛 반사점(--mx/--my)이 움직인다.
     CSS의 .glass::after 가 이 변수를 써서 radial 하이라이트를 그림.
  ------------------------------------------------------- */
  function initGlassSheen() {
    document.querySelectorAll(".glass").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        el.style.setProperty("--sheen", "1");
      });
      el.addEventListener("pointerleave", () => el.style.setProperty("--sheen", "0"));
    });
  }

  /* -------------------------------------------------------
     2) macOS Dock 확대 (magnification)
     커서와의 거리에 따라 아이콘이 부드럽게 커지고 이웃도 따라 커진다.
     실제 macOS Dock의 종형(bell) 확대 곡선을 근사.
  ------------------------------------------------------- */
  function initDock() {
    document.querySelectorAll(".dock").forEach((dock) => {
      const items = [...dock.querySelectorAll(".dock-item")];
      if (!items.length) return;
      const BASE = parseFloat(getComputedStyle(dock).getPropertyValue("--dock-base")) || 54;
      const MAX = 30;   // 커서 바로 위 아이콘의 추가 크기(px)
      const RANGE = 110; // 확대가 미치는 좌우 반경(px)

      function apply(clientX) {
        items.forEach((it) => {
          const r = it.getBoundingClientRect();
          const center = r.left + r.width / 2;
          const dist = Math.abs(clientX - center);
          const boost = dist < RANGE ? Math.cos((dist / RANGE) * (Math.PI / 2)) * MAX : 0;
          it.style.width = it.style.height = `${BASE + boost}px`;
          it.style.marginBottom = `${boost * 0.35}px`;
        });
      }
      function reset() {
        items.forEach((it) => {
          it.style.width = it.style.height = `${BASE}px`;
          it.style.marginBottom = "0px";
        });
      }
      dock.addEventListener("pointermove", (e) => apply(e.clientX));
      dock.addEventListener("pointerleave", reset);

      // 클릭하면 아이콘이 통통 튀는 macOS "bounce"
      items.forEach((it) => {
        it.addEventListener("click", () => {
          it.classList.remove("bounce");
          void it.offsetWidth; // reflow로 애니메이션 리셋
          it.classList.add("bounce");
          const label = it.getAttribute("data-label");
          const bar = document.querySelector(".dock-tip");
          if (bar && label) {
            bar.textContent = label;
            bar.classList.add("show");
            clearTimeout(bar._t);
            bar._t = setTimeout(() => bar.classList.remove("show"), 1400);
          }
        });
      });
      reset();
    });
  }

  /* -------------------------------------------------------
     3) 신호등(traffic light) 창 컨트롤
     hover 시 red/yellow/green 안에 글리프가 나타나고, 클릭 피드백.
  ------------------------------------------------------- */
  function initTrafficLights() {
    document.querySelectorAll(".traffic").forEach((tl) => {
      tl.querySelectorAll("span").forEach((dot) => {
        dot.addEventListener("click", () => {
          dot.animate(
            [{ transform: "scale(1)" }, { transform: "scale(0.82)" }, { transform: "scale(1)" }],
            { duration: 220, easing: "cubic-bezier(0.34,1.56,0.64,1)" }
          );
        });
      });
    });
  }

  /* -------------------------------------------------------
     4) iOS 세그먼티드 컨트롤 (탭 전환 + 미끄러지는 인디케이터)
     .seg 안의 .seg-item 을 클릭하면 흰 알약이 스프링으로 이동.
  ------------------------------------------------------- */
  function initSegmented() {
    document.querySelectorAll(".seg").forEach((seg) => {
      const items = [...seg.querySelectorAll(".seg-item")];
      const pill = seg.querySelector(".seg-pill");
      if (!items.length || !pill) return;
      function move(target) {
        items.forEach((i) => i.classList.remove("active"));
        target.classList.add("active");
        pill.style.width = `${target.offsetWidth}px`;
        pill.style.transform = `translateX(${target.offsetLeft - items[0].offsetLeft}px)`;
      }
      items.forEach((it) => it.addEventListener("click", () => move(it)));
      const initial = seg.querySelector(".seg-item.active") || items[0];
      // 레이아웃 확정 후 초기 위치 지정
      requestAnimationFrame(() => move(initial));
    });
  }

  /* -------------------------------------------------------
     5) iOS 토글 스위치
  ------------------------------------------------------- */
  function initToggles() {
    document.querySelectorAll(".ios-toggle").forEach((t) => {
      t.addEventListener("click", () => t.classList.toggle("on"));
    });
  }

  /* -------------------------------------------------------
     6) 공간형 패럴랙스 틸트 (.tilt)
     visionOS 시안에서 카드가 커서를 향해 살짝 기운다 + 광원 하이라이트.
  ------------------------------------------------------- */
  function initTilt() {
    const MAX = 7; // deg
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateZ(6px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateZ(0)";
      });
    });
  }

  /* -------------------------------------------------------
     7) 배경 블롭 마우스 패럴랙스 (깊이감)
     커서 위치에 따라 배경 색 덩어리가 반대로 살짝 밀린다.
  ------------------------------------------------------- */
  function initBackgroundParallax() {
    const blobs = [...document.querySelectorAll(".blob")];
    if (!blobs.length) return;
    window.addEventListener("pointermove", (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      blobs.forEach((b, i) => {
        const depth = (i + 1) * 14;
        b.style.setProperty("--px", `${-cx * depth}px`);
        b.style.setProperty("--py", `${-cy * depth}px`);
      });
    });
  }

  /* -------------------------------------------------------
     8) 스크롤 등장 애니메이션 (.reveal)
  ------------------------------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
  }

  /* -------------------------------------------------------
     부팅
  ------------------------------------------------------- */
  function boot() {
    initGlassSheen();
    initDock();
    initTrafficLights();
    initSegmented();
    initToggles();
    initTilt();
    initBackgroundParallax();
    initReveal();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
