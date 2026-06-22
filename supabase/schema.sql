create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_code text not null unique,
  category text not null,
  transaction_date date not null default current_date,
  nominal bigint not null check (nominal >= 0),
  admin_fee bigint not null default 0 check (admin_fee >= 0),
  bank_admin_fee bigint not null default 0 check (bank_admin_fee >= 0),
  total_amount bigint generated always as (nominal + admin_fee) stored,
  cashier text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.transactions
  add column if not exists bank_admin_fee bigint not null default 0;

create index if not exists transactions_transaction_date_idx
  on public.transactions (transaction_date desc);

create index if not exists transactions_created_at_idx
  on public.transactions (created_at desc);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  notes text,
  total_transactions integer not null default 0,
  last_transaction_at date,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists customers_created_at_idx
  on public.customers (created_at desc);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount bigint not null check (amount >= 0),
  description text,
  expense_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists expenses_expense_date_idx
  on public.expenses (expense_date desc);

create table if not exists public.balance_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'default',
  opening_saldo bigint not null default 0 check (opening_saldo >= 0),
  opening_cash bigint not null default 0 check (opening_cash >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.transactions enable row level security;
alter table public.customers enable row level security;
alter table public.expenses enable row level security;
alter table public.balance_settings enable row level security;

drop policy if exists "Public can read transactions" on public.transactions;
create policy "Public can read transactions"
  on public.transactions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert transactions" on public.transactions;
create policy "Public can insert transactions"
  on public.transactions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can update transactions" on public.transactions;
create policy "Public can update transactions"
  on public.transactions
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public can delete transactions" on public.transactions;
create policy "Public can delete transactions"
  on public.transactions
  for delete
  to anon, authenticated
  using (true);

drop policy if exists "Public can read customers" on public.customers;
create policy "Public can read customers"
  on public.customers
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert customers" on public.customers;
create policy "Public can insert customers"
  on public.customers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can read expenses" on public.expenses;
create policy "Public can read expenses"
  on public.expenses
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert expenses" on public.expenses;
create policy "Public can insert expenses"
  on public.expenses
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can update expenses" on public.expenses;
create policy "Public can update expenses"
  on public.expenses
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public can delete expenses" on public.expenses;
create policy "Public can delete expenses"
  on public.expenses
  for delete
  to anon, authenticated
  using (true);

drop policy if exists "Public can read balance settings" on public.balance_settings;
create policy "Public can read balance settings"
  on public.balance_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert balance settings" on public.balance_settings;
create policy "Public can insert balance settings"
  on public.balance_settings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can update balance settings" on public.balance_settings;
create policy "Public can update balance settings"
  on public.balance_settings
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Catatan:
-- Policy di atas sengaja longgar agar MVP front end bisa langsung terhubung
-- memakai anon key dari browser. Setelah login owner/kasir sudah siap,
-- sebaiknya ganti ke policy yang berbasis auth.uid() dan role pengguna.
