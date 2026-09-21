/* ================================================================
   os-shell.js — AI 메이커 OS 데스크톱 셸
   윈도우 매니저 + Dock + 메뉴바 시계 + 부팅/로그인 + 우클릭 메뉴
   + macOS 스타일 인터랙션(확대·드래그·최소화·포커스·패럴랙스).
   ================================================================ */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SPRING = "cubic-bezier(0.22,1,0.36,1)";

  let currentNick = "코딩하는너구리";

  /* ---------- 창 콘텐츠용 미니 라인 아이콘 (이모지 대체) ---------- */
  const G = (inner) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="#a7ecff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">${inner}</svg>`;
  const STEP = {
    idea: G('<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.7.7 1 1.6 1 2h6c0-.4.3-1.3 1-2a6 6 0 0 0-4-10Z"/>'),
    plan: G('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>'),
    design: G('<path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/>'),
    build: G('<path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z"/><path d="M12 12v9"/><path d="M21 8l-9 4-9-4"/>'),
    fix: G('<rect x="7" y="8" width="10" height="11" rx="5"/><path d="M12 8V5"/><path d="M9.5 5a2.5 2.5 0 0 1 5 0"/><path d="M7 12H3M21 12h-4M7 16H4M20 16h-3"/>'),
    present: G('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><path d="M12 17v4"/><path d="M9 21h6"/>'),
  };
  const tile = (glyph) =>
    `<div style="width:38px;height:38px;flex:none;padding:7px;border-radius:11px;background:rgba(100,210,255,0.14);border:1px solid rgba(255,255,255,0.12)">${glyph}</div>`;

  /* ---------- 앱 콘텐츠 템플릿 ---------- */
  const flowCard = (glyph, t, d) =>
    `<div class="flow-card"><div class="fico">${STEP[glyph]}</div><div class="t">${t}</div><div class="d">${d}</div></div>`;

  const CONTENT = {
    home: () => `
      <div class="kicker">오늘의 미션</div>
      <h1>AI와 함께 내가 상상한 것을<br><span class="grad">실제로 만드는 하루</span></h1>
      <p class="lead">코딩 문법을 외우는 하루가 아닙니다. 생각하고 → 설명하고 → 만들고 → 고치고 → 다듬는 과정을 AI와 함께 직접 경험합니다.</p>
      <div class="cta">
        <button class="btn btn-primary" data-open="materials">강의 자료 열기 →</button>
        <button class="btn btn-ghost" data-open="submit">결과물 제출하기</button>
      </div>
      <div class="panel">
        <h2>먼저, 오늘 쓸 닉네임을 정해요</h2>
        <p class="sub">제출한 결과물을 한 사람으로 묶는 데 쓰여요. 실명 대신 별명을 적어주세요.</p>
        <div class="field-row"><input class="ios-input" value="${currentNick}"/><span class="saved">저장됨 ✓</span></div>
      </div>
      <div class="section-title">오늘의 흐름</div>
      <div class="flow-grid">
        ${flowCard("idea", "아이디어 찾기", "만들고 싶은 걸 AI와 함께 발견")}
        ${flowCard("plan", "계획 세우기", "오늘 만들 크기로 범위 정하기")}
        ${flowCard("design", "화면 설계", "사용 흐름과 분위기 정하기")}
        ${flowCard("build", "함께 만들기", "AI와 첫 버전 제작")}
        ${flowCard("fix", "고치기", "문제를 설명하고 해결")}
        ${flowCard("present", "발표하기", "내가 만든 걸 보여주기")}
      </div>`,

    materials: () => `
      <div class="kicker">강의 자료</div>
      <h1 style="font-size:22px">단계별 스킬 프롬프트</h1>
      <p class="lead" style="font-size:13.5px">프롬프트 복사를 눌러 Claude 데스크탑 새 대화에 붙여넣고 시작하세요.</p>
      <div style="margin-top:16px">
        ${[
          [STEP.idea, "1교시", "아이디어 코치", "관심사에서 오늘 만들 프로젝트를 찾는다"],
          [STEP.plan, "2교시", "프로젝트 플래너", "아이디어를 오늘 만들 설계도로 바꾼다"],
          [STEP.design, "2~3교시", "UX 디자이너", "화면과 사용 흐름을 명확히 정한다"],
        ].map(([g, p, t, d]) => `
          <div class="skill-card">
            <div class="sico">${tile(g)}</div>
            <div style="flex:1">
              <div style="display:flex;gap:8px;align-items:center"><span class="badge">${p}</span><b style="font-size:14px">${t}</b></div>
              <div style="font-size:12.5px;color:var(--text-faint);margin-top:4px">${d}</div>
              <div style="display:flex;gap:8px;margin-top:10px"><button class="mini-btn primary">프롬프트 복사</button><button class="mini-btn">미리보기</button></div>
            </div>
          </div>`).join("")}
      </div>
      <div class="skeleton-note">이 창은 <b>골격</b>입니다 — 확정 후 스킬 8종 전체 + 복사/다운로드/미리보기를 실제 연결합니다.</div>`,

    submit: () => `
      <div class="kicker">결과 제출</div>
      <h1 style="font-size:22px">결과물 제출</h1>
      <p class="lead" style="font-size:13.5px">Claude가 만든 HTML 보고서를 붙여넣거나 업로드하세요.</p>
      <div style="margin-top:16px">
        <label class="fld">닉네임</label>
        <input class="ios-input" value="${currentNick}"/>
        <label class="fld" style="margin-top:12px">어떤 단계의 결과인가요?</label>
        <select class="ios-select"><option>1. 아이디어 코치</option><option>2. 프로젝트 플래너</option><option>3. UX 디자이너</option><option>4. 코딩 파트너</option></select>
        <label class="fld" style="margin-top:12px">HTML 보고서</label>
        <textarea class="ios-area" placeholder="&lt;!--ONEDAY ... --&gt; 로 시작하는 HTML을 여기에 붙여넣으세요."></textarea>
        <div class="cta"><button class="btn btn-primary">제출하기</button><button class="btn btn-ghost">파일 업로드</button></div>
      </div>
      <div class="skeleton-note">골격 — 확정 후 ONEDAY 파싱·미리보기·Supabase 저장을 실제 연결합니다.</div>`,

    dashboard: () => {
      const cards = [
        ["코딩하는너구리", "🟢 아이디어 코치", "방금", "친구 파티 궁합 분석기", "친구들 취향을 입력하면 궁합을 계산"],
        ["픽셀곰", "🟡 UX 디자이너", "3분 전", "우리반 급식 별점", "오늘 급식을 별점으로 남기는 앱"],
        ["말하는감자", "🔵 대시보드", "12분 전", "동아리 출석 체크", "QR로 동아리 출석을 기록"],
      ].map(([who, stage, ago, proj, sum]) => `
        <div class="sub-card">
          <div class="row1"><span class="who">${who}</span><span class="ago">${ago}</span></div>
          <div style="margin-top:6px"><span class="badge">${stage}</span></div>
          <div class="proj">${proj}</div><div class="sum">${sum}</div>
        </div>`).join("");
      return `
        <div class="kicker">강사 대시보드</div>
        <h1 style="font-size:22px">제출 현황</h1>
        <p class="lead" style="font-size:13.5px">제출 3건 · 학생 3명 · <span style="color:#a7f3d0">실시간 수집 중</span></p>
        <div class="field-row" style="margin-top:14px">
          <select class="ios-select" style="max-width:160px"><option>전체 단계</option></select>
          <input class="ios-input" placeholder="닉네임 검색"/>
        </div>
        <div class="sub-grid" style="margin-top:14px">${cards}</div>
        <div class="skeleton-note">골격 — 확정 후 실시간 카드·필터·보고서 모달을 실제 연결합니다.</div>`;
    },

    help: () => `
      <div class="kicker">읽어보기</div>
      <h1 style="font-size:20px">원데이 AI 클래스</h1>
      <p class="lead" style="font-size:13px">중·고등학생 원데이 AI 클래스. AI와 함께 아이디어부터 발표까지 하루 만에 완성합니다.</p>
      <div class="panel" style="margin-top:14px">
        <b style="font-size:13px">이 사이트가 하는 일</b>
        <div style="font-size:12.5px;color:var(--text-soft);margin-top:8px;line-height:1.7">
          1. 강의 자료(스킬 8종) 배포<br>2. 학생 HTML 보고서 수집 + 실시간 대시보드
        </div>
      </div>
      <div class="skeleton-note">Dock이나 바탕화면 아이콘으로 각 앱을 열어보세요.</div>`,
  };

  const APPS = {
    home:      { title: "홈 — AI 메이커데이", w: 720, h: 580, off: [0, 0] },
    materials: { title: "강의 자료", w: 640, h: 560, off: [-46, 22] },
    submit:    { title: "결과 제출", w: 600, h: 580, off: [40, 40] },
    dashboard: { title: "대시보드", w: 700, h: 520, off: [24, -6] },
    help:      { title: "읽어보기", w: 470, h: 430, off: [-30, 60] },
  };

  const winLayer = $("#windows");
  const dock = $("#dock");
  const wins = {};        // appId -> window element
  let zTop = 20;

  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;
  const dockItem = (app) => dock.querySelector(`.dock-item[data-app="${app}"]`);

  /* ---------- 창 생성 / 열기 ---------- */
  function openApp(app) {
    const cfg = APPS[app];
    if (!cfg) return;
    if (wins[app]) {
      if (wins[app].dataset.min === "1") restore(app);
      else focus(app);
      return;
    }
    const w = Math.min(cfg.w, vw() - 40);
    const h = Math.min(cfg.h, vh() - 130);
    let left = Math.round((vw() - w) / 2 + cfg.off[0]);
    let top = Math.round(60 + cfg.off[1]);
    left = Math.max(12, Math.min(left, vw() - w - 12));
    top = Math.max(38, Math.min(top, vh() - h - 96));

    const el = document.createElement("div");
    el.className = "window";
    el.dataset.app = app;
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.innerHTML = `
      <div class="titlebar">
        <div class="traffic"><i class="r"></i><i class="y"></i><i class="g"></i></div>
        <div class="win-title">${cfg.title}</div>
      </div>
      <div class="win-body">${CONTENT[app]()}</div>`;
    winLayer.appendChild(el);
    wins[app] = el;

    // 신호등
    el.querySelector(".traffic .r").addEventListener("click", (e) => { e.stopPropagation(); closeApp(app); });
    el.querySelector(".traffic .y").addEventListener("click", (e) => { e.stopPropagation(); minimize(app); });
    el.querySelector(".traffic .g").addEventListener("click", (e) => { e.stopPropagation(); toggleMax(app); });
    // 포커스 / 드래그 / 리사이즈
    el.addEventListener("pointerdown", () => focus(app));
    const tb = el.querySelector(".titlebar");
    dragify(el, tb);
    resizify(el);
    tb.addEventListener("dblclick", () => toggleMax(app)); // 타이틀바 더블클릭 = 최대화/복원
    // 내부 "앱 열기" 버튼
    el.querySelectorAll("[data-open]").forEach((b) =>
      b.addEventListener("click", () => openApp(b.dataset.open)));

    dockItem(app)?.classList.add("running");
    focus(app);

    // Dock에서 솟아오르는 오픈 애니메이션
    const di = dockItem(app)?.getBoundingClientRect();
    if (di) {
      const dx = di.left + di.width / 2 - (left + w / 2);
      const dy = di.top + di.height / 2 - (top + h / 2);
      el.style.transition = "none";
      el.style.transformOrigin = "center";
      el.style.transform = `translate(${dx}px,${dy}px) scale(0.15)`;
      el.style.opacity = "0";
      requestAnimationFrame(() => {
        el.style.transition = `transform 0.44s ${SPRING}, opacity 0.3s ease`;
        el.style.transform = "translate(0,0) scale(1)";
        el.style.opacity = "1";
      });
    } else {
      el.style.opacity = "1";
    }
  }

  function focus(app) {
    Object.values(wins).forEach((w) => w.classList.remove("active"));
    const el = wins[app];
    if (!el) return;
    el.classList.add("active");
    el.style.zIndex = ++zTop;
  }

  function closeApp(app) {
    const el = wins[app];
    if (!el) return;
    el.style.transition = `transform 0.28s ease, opacity 0.28s ease`;
    el.style.transform = "scale(0.92)";
    el.style.opacity = "0";
    setTimeout(() => {
      el.remove();
      delete wins[app];
      dockItem(app)?.classList.remove("running");
    }, 260);
  }

  function minimize(app) {
    const el = wins[app];
    if (!el || el.dataset.min === "1") return;
    const r = el.getBoundingClientRect();
    const di = dockItem(app)?.getBoundingClientRect();
    const dx = di ? di.left + di.width / 2 - (r.left + r.width / 2) : 0;
    const dy = di ? di.top + di.height / 2 - (r.top + r.height / 2) : vh();
    el.style.transformOrigin = "center bottom";
    el.style.transition = `transform 0.42s ${SPRING}, opacity 0.35s ease`;
    el.style.transform = `translate(${dx}px,${dy}px) scale(0.12)`;
    el.style.opacity = "0";
    el.dataset.min = "1";
    setTimeout(() => { if (el.dataset.min === "1") el.style.visibility = "hidden"; }, 420);
  }
  function restore(app) {
    const el = wins[app];
    if (!el) return;
    el.style.visibility = "visible";
    el.dataset.min = "0";
    requestAnimationFrame(() => {
      el.style.transition = `transform 0.42s ${SPRING}, opacity 0.3s ease`;
      el.style.transform = "translate(0,0) scale(1)";
      el.style.opacity = "1";
    });
    focus(app);
  }

  function toggleMax(app) {
    const el = wins[app];
    if (!el) return;
    el.style.transition = `left 0.36s ${SPRING}, top 0.36s ${SPRING}, width 0.36s ${SPRING}, height 0.36s ${SPRING}`;
    if (el.dataset.max === "1") {
      const p = JSON.parse(el.dataset.prev);
      Object.assign(el.style, { left: p.l + "px", top: p.t + "px", width: p.w + "px", height: p.h + "px" });
      el.dataset.max = "0";
    } else {
      el.dataset.prev = JSON.stringify({
        l: parseInt(el.style.left), t: parseInt(el.style.top),
        w: parseInt(el.style.width), h: parseInt(el.style.height),
      });
      Object.assign(el.style, { left: "12px", top: "38px", width: vw() - 24 + "px", height: vh() - 38 - 84 + "px" });
      el.dataset.max = "1";
    }
    focus(app);
  }

  /* ---------- 드래그 ---------- */
  function dragify(el, handle) {
    let sx, sy, ol, ot, dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".traffic")) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ol = parseInt(el.style.left); ot = parseInt(el.style.top);
      el.style.transition = "none";
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      let nl = ol + (e.clientX - sx);
      let nt = ot + (e.clientY - sy);
      nl = Math.max(-(el.offsetWidth - 120), Math.min(nl, vw() - 120));
      nt = Math.max(32, Math.min(nt, vh() - 100));
      el.style.left = nl + "px";
      el.style.top = nt + "px";
    });
    handle.addEventListener("pointerup", (e) => {
      dragging = false;
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
    });
  }

  /* ---------- 리사이즈 (8방향, 실제 OS처럼) ---------- */
  function resizify(el) {
    const MINW = 340, MINH = 240;
    ["n", "s", "e", "w", "ne", "nw", "se", "sw"].forEach((dir) => {
      const h = document.createElement("div");
      h.className = "resize-handle rh-" + dir;
      el.appendChild(h);
      let st = null;
      h.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        focus(el.dataset.app);
        st = {
          x: e.clientX, y: e.clientY,
          l: parseInt(el.style.left), t: parseInt(el.style.top),
          w: parseInt(el.style.width), h: parseInt(el.style.height),
        };
        el.style.transition = "none";
        el.dataset.max = "0";
        h.setPointerCapture(e.pointerId);
      });
      h.addEventListener("pointermove", (e) => {
        if (!st) return;
        const dx = e.clientX - st.x, dy = e.clientY - st.y;
        let l = st.l, t = st.t, w = st.w, ht = st.h;
        if (dir.includes("e")) w = st.w + dx;
        if (dir.includes("s")) ht = st.h + dy;
        if (dir.includes("w")) { w = st.w - dx; l = st.l + dx; }
        if (dir.includes("n")) { ht = st.h - dy; t = st.t + dy; }
        // 최소 크기 (왼/위로 줄일 땐 left/top 보정)
        if (w < MINW) { if (dir.includes("w")) l = st.l + (st.w - MINW); w = MINW; }
        if (ht < MINH) { if (dir.includes("n")) t = st.t + (st.h - MINH); ht = MINH; }
        // 화면 경계 (메뉴바~Dock 사이)
        if (t < 32) { ht -= 32 - t; t = 32; }
        if (l < 4) { w -= 4 - l; l = 4; }
        const maxH = vh() - 84 - t; if (ht > maxH) ht = maxH;
        const maxW = vw() - 8 - l; if (w > maxW) w = maxW;
        el.style.left = l + "px"; el.style.top = t + "px";
        el.style.width = w + "px"; el.style.height = ht + "px";
      });
      h.addEventListener("pointerup", (e) => {
        st = null;
        try { h.releasePointerCapture(e.pointerId); } catch (_) {}
      });
    });
  }

  /* ---------- Dock: 확대 + 클릭 + 툴팁 ---------- */
  function initDock() {
    const items = $$(".dock-item", dock);
    const BASE = 56, MAX = 34, RANGE = 115;
    const tip = $(".dock-tip");
    function apply(x) {
      items.forEach((it) => {
        const r = it.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(x - c);
        const boost = d < RANGE ? Math.cos((d / RANGE) * (Math.PI / 2)) * MAX : 0;
        it.style.width = it.style.height = BASE + boost + "px";
        it.style.marginBottom = boost * 0.32 + "px";
      });
    }
    function reset() { items.forEach((it) => { it.style.width = it.style.height = BASE + "px"; it.style.marginBottom = "0px"; }); }
    dock.addEventListener("pointermove", (e) => apply(e.clientX));
    dock.addEventListener("pointerleave", reset);
    items.forEach((it) => {
      it.addEventListener("mouseenter", () => {
        tip.textContent = it.dataset.label; tip.classList.add("show");
        const r = it.getBoundingClientRect();
        tip.style.left = r.left + r.width / 2 - tip.offsetWidth / 2 + "px";
      });
      it.addEventListener("mouseleave", () => tip.classList.remove("show"));
      it.addEventListener("click", () => {
        it.classList.remove("bounce"); void it.offsetWidth; it.classList.add("bounce");
        openApp(it.dataset.app);
      });
    });
    reset();
  }

  /* ---------- 바탕화면 아이콘 ---------- */
  function initDesktopIcons() {
    const icons = $$(".desktop-icon");
    icons.forEach((ic) => {
      ic.addEventListener("click", (e) => {
        e.stopPropagation();
        icons.forEach((i) => i.classList.remove("selected"));
        ic.classList.add("selected");
      });
      ic.addEventListener("dblclick", () => openApp(ic.dataset.app));
    });
    $("#desktop").addEventListener("click", () => icons.forEach((i) => i.classList.remove("selected")));
  }

  /* ---------- 우클릭 컨텍스트 메뉴 ---------- */
  function initContextMenu() {
    const cm = $("#context-menu");
    const walls = [
      ["#6b7280", "#3a4150", "#23283a"],
      ["#7c6f9e", "#4a4066", "#241f38"],
      ["#5b7d74", "#37564d", "#1e2a26"],
      ["#8a6d74", "#5a3f47", "#2a1e22"],
    ];
    let wi = 0;
    $("#desktop").addEventListener("contextmenu", (e) => {
      e.preventDefault();
      cm.classList.add("show");
      const x = Math.min(e.clientX, vw() - 210);
      const y = Math.min(e.clientY, vh() - 180);
      cm.style.left = x + "px"; cm.style.top = y + "px";
    });
    document.addEventListener("click", () => cm.classList.remove("show"));
    document.addEventListener("pointerdown", (e) => { if (!e.target.closest("#context-menu")) cm.classList.remove("show"); });
    cm.querySelectorAll(".cm-item").forEach((it) =>
      it.addEventListener("click", () => {
        if (it.dataset.cm === "wallpaper") {
          wi = (wi + 1) % walls.length;
          const [a, b, c] = walls[wi];
          document.body.style.setProperty("--wall-a", a);
          document.body.style.setProperty("--wall-b", b);
          document.body.style.setProperty("--wall-c", c);
        }
        cm.classList.remove("show");
      }));
  }

  /* ---------- 메뉴바 시계 ---------- */
  function initClock() {
    const el = $("#clock");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    function tick() {
      const d = new Date();
      let h = d.getHours();
      const ampm = h < 12 ? "오전" : "오후";
      let hh = h % 12; if (hh === 0) hh = 12;
      const mm = String(d.getMinutes()).padStart(2, "0");
      el.textContent = `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]}) ${ampm} ${hh}:${mm}`;
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- 글래스 스페큘러 + 배경 패럴랙스 ---------- */
  function initSheen() {
    $$(".glass").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        el.style.setProperty("--sheen", "1");
      });
      el.addEventListener("pointerleave", () => el.style.setProperty("--sheen", "0"));
    });
  }
  function initParallax() {
    const blobs = $$(".blob");
    window.addEventListener("pointermove", (e) => {
      const cx = e.clientX / vw() - 0.5, cy = e.clientY / vh() - 0.5;
      blobs.forEach((b, i) => {
        const dep = (i + 1) * 16;
        b.style.setProperty("--px", -cx * dep + "px");
        b.style.setProperty("--py", -cy * dep + "px");
      });
    });
  }

  /* ---------- 부팅 → 로그인 → 데스크톱 ---------- */
  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    const nm = $("#loginName").value.trim();
    if (nm) currentNick = nm;
    $("#boot").classList.add("hide");
    $("#login").classList.add("hide");
    $("#skipBtn").style.display = "none";
    setTimeout(() => {
      openApp("home");
      const hb = $("#hintBadge");
      hb.classList.add("show");
      setTimeout(() => hb.classList.remove("show"), 5200);
    }, 420);
  }
  function initBootFlow() {
    const params = new URLSearchParams(location.search);
    // 딥링크: ?auto=1 → 인트로 건너뛰고 데스크톱, &apps=materials,dashboard → 추가 창 열기
    if (params.get("auto") === "1") {
      enter();
      const extra = (params.get("apps") || "").split(",").map((s) => s.trim()).filter(Boolean);
      extra.forEach((a, i) => setTimeout(() => openApp(a), 700 + i * 250));
      return;
    }
    setTimeout(() => {
      if (entered) return;
      $("#boot").classList.add("hide");
      $("#login").classList.remove("hide");
      $("#loginName").focus();
    }, 1250);
    $("#loginGo").addEventListener("click", enter);
    $("#loginName").addEventListener("keydown", (e) => { if (e.key === "Enter") enter(); });
    $("#skipBtn").addEventListener("click", enter);
  }

  /* ---------- 부팅 ---------- */
  function boot() {
    initClock();
    initDock();
    initDesktopIcons();
    initContextMenu();
    initSheen();
    initParallax();
    initBootFlow();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
