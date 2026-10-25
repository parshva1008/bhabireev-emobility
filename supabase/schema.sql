-- Bhabireev E-Mobility: production-oriented Supabase schema.
-- Run in Supabase SQL Editor as project owner. Review and test policies before public launch.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 1 and 80),
  model text not null check (char_length(model) between 1 and 100),
  vehicle_type text not null check (vehicle_type in ('scooter','bike')),
  year integer not null check (year between 2000 and 2100),
  price numeric(12,2) not null check (price >= 0 and price <= 10000000),
  odometer_km integer not null default 0 check (odometer_km >= 0),
  battery_capacity text,
  claimed_range_km integer check (claimed_range_km is null or claimed_range_km between 0 and 2000),
  battery_health_status text not null default 'Not tested'
    check (battery_health_status in ('Not tested','Tested','Report available')),
  colour text,
  condition text not null default 'Good'
    check (condition in ('Excellent','Good','Fair','Needs inspection')),
  status text not null default 'available'
    check (status in ('available','reserved','sold')),
  description text not null default '' check (char_length(description) <= 5000),
  image_urls text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vehicles enable row level security;
create index if not exists vehicles_public_search_idx on public.vehicles(status, published, created_at desc);
create index if not exists vehicles_brand_idx on public.vehicles(brand);

drop policy if exists "Public can view published available vehicles" on public.vehicles;
create policy "Public can view published available vehicles"
on public.vehicles for select to anon, authenticated
using ((published = true and status = 'available') or public.is_site_admin());

drop policy if exists "Admins can insert vehicles" on public.vehicles;
create policy "Admins can insert vehicles" on public.vehicles
for insert to authenticated with check (public.is_site_admin());

drop policy if exists "Admins can update vehicles" on public.vehicles;
create policy "Admins can update vehicles" on public.vehicles
for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "Admins can delete vehicles" on public.vehicles;
create policy "Admins can delete vehicles" on public.vehicles
for delete to authenticated using (public.is_site_admin());

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  phone text not null check (char_length(phone) between 10 and 16),
  email text check (email is null or char_length(email) <= 254),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  vehicle_label text not null default 'General enquiry' check (char_length(vehicle_label) <= 200),
  preferred_colour text check (preferred_colour is null or char_length(preferred_colour) <= 60),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new','contacted','negotiating','converted','closed')),
  created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
drop policy if exists "Anyone can submit an enquiry" on public.enquiries;
create policy "Anyone can submit an enquiry" on public.enquiries
for insert to anon, authenticated with check (
  char_length(customer_name) between 1 and 100
  and char_length(phone) between 10 and 16
  and char_length(vehicle_label) <= 200
  and (message is null or char_length(message) <= 2000)
  and status = 'new'
);
drop policy if exists "Admins can read enquiries" on public.enquiries;
create policy "Admins can read enquiries" on public.enquiries
for select to authenticated using (public.is_site_admin());
drop policy if exists "Admins can update enquiries" on public.enquiries;
create policy "Admins can update enquiries" on public.enquiries
for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
drop policy if exists "Admins can delete enquiries" on public.enquiries;
create policy "Admins can delete enquiries" on public.enquiries
for delete to authenticated using (public.is_site_admin());

create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  business_name text not null default 'Bhabireev',
  tagline text not null default 'Better journeys. Thoughtful electric mobility.',
  contact_email text not null default '',
  contact_phone text not null default '',
  whatsapp_number text not null default '',
  location text not null default 'Sangli, Maharashtra, India',
  hero_title text not null default 'Your next ride. Electrified.',
  hero_description text not null default 'Discover thoughtfully selected pre-owned electric scooters and bikes.',
  accent_colour text not null default '#277956' check (accent_colour ~ '^#[0-9A-Fa-f]{6}$'),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "Public can read website settings" on public.site_settings;
create policy "Public can read website settings" on public.site_settings
for select to anon, authenticated using (true);
drop policy if exists "Admins can insert website settings" on public.site_settings;
create policy "Admins can insert website settings" on public.site_settings
for insert to authenticated with check (public.is_site_admin());
drop policy if exists "Admins can update website settings" on public.site_settings;
create policy "Admins can update website settings" on public.site_settings
for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Create a PUBLIC bucket for vehicle listing photos. Never upload private/customer documents here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-photos','vehicle-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view vehicle photos" on storage.objects;
create policy "Public can view vehicle photos" on storage.objects
for select to anon, authenticated using (bucket_id = 'vehicle-photos');

drop policy if exists "Admins can upload vehicle photos" on storage.objects;
create policy "Admins can upload vehicle photos" on storage.objects
for insert to authenticated with check (bucket_id = 'vehicle-photos' and public.is_site_admin());

drop policy if exists "Admins can update vehicle photos" on storage.objects;
create policy "Admins can update vehicle photos" on storage.objects
for update to authenticated using (bucket_id = 'vehicle-photos' and public.is_site_admin())
with check (bucket_id = 'vehicle-photos' and public.is_site_admin());

drop policy if exists "Admins can delete vehicle photos" on storage.objects;
create policy "Admins can delete vehicle photos" on storage.objects
for delete to authenticated using (bucket_id = 'vehicle-photos' and public.is_site_admin());

-- IMPORTANT: Do NOT insert an admin user using an email alone.
-- After creating your owner user in Supabase Authentication, copy that user's UUID.
-- Then run: insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
