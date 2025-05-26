-- Step 1: 切换为 postgres 或 owner 用户执行
-- 如果你在 SQL 编辑器中，默认是 postgres，无需更改

create or replace function create_data_table_keys(name text, key_parts text[])
returns text
language plpgsql
security definer  -- 核心关键，使用定义者权限
as $$
declare
  exists boolean;
  key_definitions text := '';
  primary_keys text := '';
  i int;
  field_name text;
  sql text;
begin
  -- 检查表是否已存在
  select exists (
    select from information_schema.tables
    where table_schema = 'public' and table_name = name
  ) into exists;

  if exists then
    return format('⚠️ Table "%s" already exists.', name);
  end if;

  -- 构建字段定义和主键定义
  for i in 1 .. array_length(key_parts, 1) loop
    field_name := key_parts[i];
    key_definitions := key_definitions || format('%I TEXT NOT NULL, ', field_name);

    if i = 1 then
      primary_keys := format('%I', field_name);
    else
      primary_keys := primary_keys || format(', %I', field_name);
    end if;
  end loop;

  -- 拼接完整的建表 SQL（含 updated_at）
  sql := format(
    'create table %I (
      %s
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      data jsonb,
      primary key (%s)
    )',
    name,
    key_definitions,
    primary_keys
  );

  -- 执行创建表
  execute sql;

  -- 添加 updated_at 触发器
  execute format(
    'create trigger set_updated_at
     before update on %I
     for each row
     execute function update_updated_at_column();',
    name
  );

  return format('✅ Table "%s" with primary key (%s) created successfully.', name, primary_keys);
end;
$$;

-- Step 2: 允许别人调用这个函数，但不拥有建表权限

GRANT EXECUTE ON FUNCTION create_data_table_keys(TEXT, TEXT[]) TO anon;
GRANT EXECUTE ON FUNCTION create_data_table_keys(TEXT, TEXT[]) TO authenticated;
