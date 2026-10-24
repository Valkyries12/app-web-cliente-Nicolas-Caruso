-- KIHAP - esquema del catálogo para Supabase
-- Ejecutar en el SQL Editor del proyecto antes de seed.sql.

create table if not exists public.products (
  id bigint primary key,
  name text not null,
  category text not null check (category in ('doboks', 'protecciones', 'cinturones', 'accesorios')),
  price bigint not null check (price >= 0),
  sizes text[],
  colors text[],
  featured boolean not null default false,
  badge text,
  description text not null,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (active = true);

-- El frontend solo puede leer. Las escrituras quedan para el dashboard
-- o para una Edge Function con service_role.
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
