-- Step 1: 切换为 postgres 或 owner 用户执行
-- 如果你在 SQL 编辑器中，默认是 postgres，无需更改

CREATE OR REPLACE FUNCTION create_data_table_keys(name TEXT, key_parts TEXT[])

RETURNS TEXT

LANGUAGE plpgsql

SECURITY DEFINER

AS $$

DECLARE

  exists BOOLEAN;

  key_definitions TEXT := '';

  primary_keys TEXT := '';

  i INT;

  field_name TEXT;

  sql TEXT;

BEGIN

  -- 检查表是否存在
  SELECT EXISTS (

    SELECT FROM information_schema.tables

    WHERE table_schema = 'public' AND table_name = name

  ) INTO exists;

  IF exists THEN

    RETURN format('⚠️ Table "%s" already exists.', name);

  END IF;

  -- 构建字段定义和主键定义
  FOR i IN 1 .. array_length(key_parts, 1) LOOP

    field_name := key_parts[i];

    -- 添加字段定义
    key_definitions := key_definitions || format('%I TEXT NOT NULL, ', field_name);

    -- 构建主键部分
    IF i = 1 THEN
      primary_keys := format('%I', field_name);
    ELSE
      primary_keys := primary_keys || format(', %I', field_name);
    END IF;

  END LOOP;

  -- 拼接 SQL 创建语句
  sql := format(
    'CREATE TABLE %I (
      %s
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      data JSONB,
      PRIMARY KEY (%s)
    )',
    name,
    key_definitions,
    primary_keys
  );

  EXECUTE sql;

  RETURN format('✅ Table "%s" with primary key (%s) created successfully.', name, primary_keys);

END;

$$;

-- Step 2: 允许别人调用这个函数，但不拥有建表权限

GRANT EXECUTE ON FUNCTION create_data_table_keys(TEXT, TEXT[]) TO anon;

GRANT EXECUTE ON FUNCTION create_data_table_keys(TEXT, TEXT[]) TO authenticated;
