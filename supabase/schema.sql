-- 원데이 AI 클래스 — 제출 수집 테이블
-- Supabase 프로젝트의 SQL Editor에 붙여넣어 실행하세요.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student text not null,
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

-- RLS 활성화
alter table public.submissions enable row level security;

-- 수업용 정책: 익명(anon) 키로 제출(insert)과 조회(select)를 허용한다.
-- 주의: 이 정책은 "제출물이 서로 보여도 되는" 오픈 수업을 전제로 한다.
-- 학생끼리 서로 못 보게 하려면 select 정책을 강사 인증으로 좁혀야 한다.
drop policy if exists "anon can insert" on public.submissions;
create policy "anon can insert"
  on public.submissions for insert
  to anon
  with check (true);

drop policy if exists "anon can select" on public.submissions;
create policy "anon can select"
  on public.submissions for select
  to anon
  using (true);

-- 실시간(Realtime) 구독 활성화
alter publication supabase_realtime add table public.submissions;
