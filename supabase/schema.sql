-- 원데이 AI 클래스 — DB 스키마 (신규 셋업용 전체본)
-- Supabase 프로젝트의 SQL Editor에 붙여넣어 실행하세요.
-- 이미 운영 중인 DB라면 supabase/migrations/20260921_students_and_dates.sql 을 쓰세요.

-- ============================================================
-- students — 닉네임 = 유일한 유저 키
-- ============================================================
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  created_at timestamptz not null default now()
);

-- 대소문자 무시 유일성 (예: "Bob" == "bob"). 닉네임 = 유저 키.
create unique index if not exists students_nickname_lower_key
  on public.students (lower(nickname));

alter table public.students enable row level security;

-- 오픈 수업 전제: anon 이 조회/생성 가능. UPDATE/DELETE 정책은 두지 않는다
-- (닉네임 변조·타인 레코드 수정 방지). 유일성은 위 unique index 가 강제한다.
drop policy if exists "anon read students" on public.students;
create policy "anon read students"
  on public.students for select to anon using (true);

drop policy if exists "anon insert students" on public.students;
create policy "anon insert students"
  on public.students for insert to anon with check (true);

-- ============================================================
-- submissions — 제출 1건 (학생 HTML 보고서 + 파싱 메타)
-- ============================================================
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- class_date: 제출이 속한 "수업 날짜"(Asia/Seoul 기준). 날짜별 데이터 누적용.
  class_date date not null default ((now() at time zone 'Asia/Seoul')::date),
  student_id uuid references public.students(id),
  student text not null,          -- 닉네임(비정규화 — 표시/하위호환용)
  stage text not null,
  project text,
  summary text,
  payload jsonb,
  report_html text not null,
  session_code text
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);
create index if not exists submissions_stage_idx
  on public.submissions (stage);
create index if not exists submissions_student_id_idx
  on public.submissions (student_id);
create index if not exists submissions_class_date_idx
  on public.submissions (class_date desc);

alter table public.submissions enable row level security;

-- 수업용 정책: 익명(anon) 키로 제출(insert)과 조회(select)를 허용한다.
-- 주의: "제출물이 서로 보여도 되는" 오픈 수업 전제. 비공개가 필요하면 select 를 강사 인증으로 좁힌다.
drop policy if exists "anon can insert" on public.submissions;
create policy "anon can insert"
  on public.submissions for insert to anon with check (true);

drop policy if exists "anon can select" on public.submissions;
create policy "anon can select"
  on public.submissions for select to anon using (true);

-- 실시간(Realtime) 구독 활성화
alter publication supabase_realtime add table public.submissions;
