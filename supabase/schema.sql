-- Table du journal d'entraînement (une ligne par séance)
create table if not exists public.muscu_sessions (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  id         text        not null,
  date       date        not null,
  seance     text,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists muscu_sessions_user_date on public.muscu_sessions (user_id, date);

-- Chacun ne voit et ne modifie que ses propres séances
alter table public.muscu_sessions enable row level security;

drop policy if exists "lecture perso" on public.muscu_sessions;
drop policy if exists "ajout perso" on public.muscu_sessions;
drop policy if exists "modif perso" on public.muscu_sessions;
drop policy if exists "suppression perso" on public.muscu_sessions;

create policy "lecture perso" on public.muscu_sessions
  for select using (auth.uid() = user_id);
create policy "ajout perso" on public.muscu_sessions
  for insert with check (auth.uid() = user_id);
create policy "modif perso" on public.muscu_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "suppression perso" on public.muscu_sessions
  for delete using (auth.uid() = user_id);
