-- Supabase で実行するSQL
-- https://app.supabase.com のSQL Editorに貼り付けて実行してください

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 誰でも読み書きできるようにするポリシー（認証なしで使う場合）
alter table reports enable row level security;

create policy "allow_all" on reports
  for all
  using (true)
  with check (true);
