-- Step 1: 切换为 postgres 或 owner 用户执行
-- 如果你在 SQL 编辑器中，默认是 postgres，无需更改

create or replace function create_data_table(name text)
returns text
language plpgsql
security definer  -- 核心关键，使用定义者权限
as $$
declare
  exists boolean;
begin
  select exists (
    select from information_schema.tables 
    where table_schema = 'public' and table_name = name
  ) into exists;

  if exists then
    return format('⚠️ Table "%s" already exists.', name);
  else
    execute format(
      'create table %I (
        id text primary key default gen_random_uuid()::text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        data jsonb
      )',
      name
    );

    execute format(
      'create trigger set_updated_at
       before update on %I
       for each row
       execute function update_updated_at_column();',
      name
    );

    return format('✅ Table "%s" created successfully.', name);
  end if;
end;
$$;

-- Step 2: 允许别人调用这个函数，但不拥有建表权限

GRANT EXECUTE ON FUNCTION create_data_table(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_data_table(TEXT) TO authenticated;