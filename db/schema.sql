-- ZEIRO JUEGOS · Esquema Supabase
create table if not exists zj_games (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  subject text default '',
  level text default '',
  instructions text default '',
  content jsonb not null default '{}'::jsonb,
  options jsonb not null default '{}'::jsonb,
  image text default '',
  owner_token text not null,
  owner_name text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists zj_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  owner_token text not null,
  owner_name text default '',
  roster jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists zj_class_games (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references zj_classes(id) on delete cascade,
  game_id uuid not null references zj_games(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, game_id)
);
create table if not exists zj_attempts (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references zj_games(id) on delete cascade,
  class_code text default '',
  student_name text not null,
  score int not null default 0,
  correct int not null default 0,
  total int not null default 0,
  time_ms int not null default 0,
  answers jsonb not null default '[]'::jsonb,
  game_title text default '',
  game_type text default '',
  created_at timestamptz not null default now()
);
create index if not exists zj_attempts_game_idx on zj_attempts(game_id);
create index if not exists zj_attempts_class_idx on zj_attempts(class_code);
create index if not exists zj_games_owner_idx on zj_games(owner_token);
create index if not exists zj_classes_owner_idx on zj_classes(owner_token);

-- Guardar/editar juego verificando el token del dueño
create or replace function zj_save_game(p_id uuid, p_owner_token text, p_data jsonb)
returns zj_games language plpgsql security definer set search_path = public as $$
declare r zj_games;
begin
  if p_id is null then
    insert into zj_games (type,title,subject,level,instructions,content,options,image,owner_token,owner_name)
    values (p_data->>'type', p_data->>'title', coalesce(p_data->>'subject',''), coalesce(p_data->>'level',''),
            coalesce(p_data->>'instructions',''), coalesce(p_data->'content','{}'::jsonb), coalesce(p_data->'options','{}'::jsonb),
            coalesce(p_data->>'image',''), p_owner_token, coalesce(p_data->>'owner_name',''))
    returning * into r;
    return r;
  end if;
  update zj_games set
    type = p_data->>'type', title = p_data->>'title', subject = coalesce(p_data->>'subject',''),
    level = coalesce(p_data->>'level',''), instructions = coalesce(p_data->>'instructions',''),
    content = coalesce(p_data->'content','{}'::jsonb), options = coalesce(p_data->'options','{}'::jsonb),
    image = coalesce(p_data->>'image',''), owner_name = coalesce(p_data->>'owner_name',''), updated_at = now()
  where id = p_id and owner_token = p_owner_token
  returning * into r;
  if not found then raise exception 'No autorizado'; end if;
  return r;
end $$;
create or replace function zj_delete_game(p_id uuid, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from zj_games where id = p_id and owner_token = p_owner_token;
  return found;
end $$;
create or replace function zj_save_class(p_id uuid, p_owner_token text, p_data jsonb)
returns zj_classes language plpgsql security definer set search_path = public as $$
declare r zj_classes;
begin
  update zj_classes set
    name = p_data->>'name', roster = coalesce(p_data->'roster','[]'::jsonb), owner_name = coalesce(p_data->>'owner_name','')
  where id = p_id and owner_token = p_owner_token
  returning * into r;
  if not found then raise exception 'No autorizado'; end if;
  return r;
end $$;
create or replace function zj_delete_class(p_id uuid, p_owner_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from zj_classes where id = p_id and owner_token = p_owner_token;
  return found;
end $$;
