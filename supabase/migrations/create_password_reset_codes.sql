create table if not exists password_reset_codes (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean not null default false,
  created_at timestamptz not null default now()
);

-- No RLS policies — only the service role key can read/write this table.
-- Public (anon) access is blocked by default when RLS is enabled.
alter table password_reset_codes enable row level security;

-- Index for fast lookups by email
create index if not exists password_reset_codes_email_idx on password_reset_codes (email);
