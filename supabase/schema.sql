-- Voice of Customer: run this whole file once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  type text not null check (type in ('choice', 'yesno', 'nps', 'text', 'name', 'phone')),
  options jsonb not null default '[]'::jsonb,
  required boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text not null default ''
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  branch_id uuid not null references branches(id),
  customer_name text,
  customer_phone text,
  staff_id uuid references auth.users(id) on delete set null,
  staff_name text,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  responded_at timestamptz
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id),
  visit_id uuid references visits(id) on delete set null,
  source text not null default 'qr' check (source in ('qr', 'whatsapp')),
  session_id text,
  user_agent text,
  os text,
  browser text,
  device text,
  country text,
  city text,
  language text,
  screen text,
  timezone text,
  referrer text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references scans(id) on delete cascade,
  branch_id uuid not null references branches(id),
  visit_id uuid references visits(id) on delete set null,
  rating int check (rating between 1 and 5),
  answers jsonb not null default '[]'::jsonb,
  name text,
  phone text,
  status text not null default 'partial' check (status in ('partial', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists scans_created_idx on scans (created_at desc);
create index if not exists scans_branch_idx on scans (branch_id);
create index if not exists responses_branch_idx on responses (branch_id);
create index if not exists visits_created_idx on visits (created_at desc);

-- All access goes through the server with the service role key.
-- RLS is on with no public policies, so the anon key can read nothing.
alter table profiles enable row level security;
alter table branches enable row level security;
alter table questions enable row level security;
alter table settings enable row level security;
alter table visits enable row level security;
alter table scans enable row level security;
alter table responses enable row level security;

-- Starter questions (edit or delete them later from the dashboard).
insert into questions (label, type, options, required, sort_order)
select * from (values
  ('Who looked after you today?', 'text', '[]'::jsonb, false, 1),
  ('How likely are you to recommend us to a friend or colleague?', 'nps', '[]'::jsonb, false, 2),
  ('What could we do better?', 'text', '[]'::jsonb, false, 3),
  ('Would you like a member of our team to contact you?', 'yesno', '[]'::jsonb, false, 4),
  ('Your name', 'name', '[]'::jsonb, false, 5),
  ('Mobile number', 'phone', '[]'::jsonb, false, 6)
) as v(label, type, options, required, sort_order)
where not exists (select 1 from questions);

-- FIRST ADMIN: create a user in Supabase > Authentication > Users (email + password,
-- tick "Auto Confirm User"), then run the statement below with that email.
--
-- insert into profiles (id, full_name, role)
-- select id, 'Admin', 'admin' from auth.users where email = 'PUT_THE_EMAIL_HERE'
-- on conflict (id) do update set role = 'admin', active = true;
