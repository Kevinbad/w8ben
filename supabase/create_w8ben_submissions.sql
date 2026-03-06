-- Create table for public W-8BEN form submissions
create table if not exists public.w8ben_submissions (
  id uuid default gen_random_uuid() primary key,
  email text,
  full_name text,
  dob date,
  address_line1 text,
  address_city text,
  address_state text,
  address_postal_code text,
  citizenship_country text,
  us_tin text,
  foreign_tin text,
  dolar_tag text,
  contract_url text,
  status text default 'pending' check (status in ('pending', 'signed', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table w8ben_submissions enable row level security;

-- Policies
-- 1. Anyone can insert a new submission (Public drop-box)
create policy "Anyone can insert a submission" on w8ben_submissions
  for insert with check (true);

-- 2. Only admins can view all submissions
create policy "Admins can view all submissions" on w8ben_submissions
  for select using (public.is_admin());

-- 3. Only admins can update submissions (Users update local state until final submit)
create policy "Admins can update submissions" on w8ben_submissions
  for update using (public.is_admin());

-- Note: The PDF generated at the end will be uploaded via Service Role, 
-- which bypasses RLS, so we don't need a public update policy for the `contract_url`.
