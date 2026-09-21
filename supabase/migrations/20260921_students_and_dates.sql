-- ============================================================
-- 마이그레이션: 학생 정체성(students) + 날짜별 제출(class_date)
-- 대상: 이미 submissions 데이터가 있는 라이브 DB (crtelhaxvnvmfpxiqwqo)
-- 성격: 비파괴 (컬럼/테이블 추가 + 기존행 백필). DROP/DELETE 없음.
-- 실행: Supabase SQL Editor 에 통째로 붙여넣어 실행. 재실행해도 안전(idempotent).
-- 사전 확인 권장: select count(*) from public.submissions;
-- ============================================================

-- 1) students 테이블 (닉네임 = 유일 유저 키) --------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists students_nickname_lower_key
  on public.students (lower(nickname));

alter table public.students enable row level security;

drop policy if exists "anon read students" on public.students;
create policy "anon read students"
  on public.students for select to anon using (true);

drop policy if exists "anon insert students" on public.students;
create policy "anon insert students"
  on public.students for insert to anon with check (true);

-- 2) submissions 확장: student_id + class_date --------------------
alter table public.submissions
  add column if not exists student_id uuid references public.students(id);

alter table public.submissions
  add column if not exists class_date date;   -- 우선 nullable 로 추가

-- 기존 행 백필: 제출 날짜(Asia/Seoul) 로 채움
update public.submissions
  set class_date = (created_at at time zone 'Asia/Seoul')::date
  where class_date is null;

-- 이후 신규 행은 서버 기본값(서울 오늘) + NOT NULL
alter table public.submissions
  alter column class_date set default ((now() at time zone 'Asia/Seoul')::date);
alter table public.submissions
  alter column class_date set not null;

create index if not exists submissions_student_id_idx
  on public.submissions (student_id);
create index if not exists submissions_class_date_idx
  on public.submissions (class_date desc);

-- 3) 기존 닉네임 → students 백필 + 링크 --------------------------
insert into public.students (nickname, created_at)
select student, min(created_at)
from public.submissions
where coalesce(student, '') <> ''
group by student
on conflict (lower(nickname)) do nothing;

update public.submissions s
  set student_id = st.id
from public.students st
where s.student_id is null
  and lower(s.student) = lower(st.nickname);

-- 4) 검증용 참고 쿼리 (실행 후 확인) ----------------------------
-- select count(*) as no_student_id from public.submissions where student_id is null;   -- 0 이어야 정상(닉네임 있는 행 기준)
-- select nickname, count(*) from public.students group by 1 order by 2 desc;
-- select class_date, count(*) from public.submissions group by 1 order by 1;
