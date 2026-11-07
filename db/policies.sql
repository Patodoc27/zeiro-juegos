-- ZEIRO JUEGOS · RLS
alter table zj_games enable row level security;
alter table zj_classes enable row level security;
alter table zj_class_games enable row level security;
alter table zj_attempts enable row level security;

create policy zj_games_read on zj_games for select using (true);
create policy zj_games_insert on zj_games for insert with check (true);
-- update/delete solo vía funciones security definer (zj_save_game / zj_delete_game)

create policy zj_classes_read on zj_classes for select using (true);
create policy zj_classes_insert on zj_classes for insert with check (true);

create policy zj_class_games_all on zj_class_games for all using (true) with check (true);

create policy zj_attempts_read on zj_attempts for select using (true);
create policy zj_attempts_insert on zj_attempts for insert with check (true);
