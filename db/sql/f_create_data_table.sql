-- Step 1: 切换为 postgres 或 owner 用户执行
-- 如果你在 SQL 编辑器中，默认是 postgres，无需更改

CREATE OR REPLACE FUNCTION create_data_table(name TEXT)

RETURNS TEXT

LANGUAGE plpgsql

SECURITY DEFINER  -- 核心关键，使用定义者权限

AS $$

DECLARE

  exists BOOLEAN;

BEGIN

  SELECT EXISTS (

    SELECT FROM information_schema.tables 

    WHERE table_schema = 'public' AND table_name = name

  ) INTO exists;

  IF exists THEN

    RETURN format('⚠️ Table "%s" already exists.', name);

  ELSE

    EXECUTE format(
      'CREATE TABLE %I (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        data JSONB
      )',
      name
    );

    RETURN format('✅ Table "%s" created successfully.', name);

  END IF;

END;

$$;

-- Step 2: 允许别人调用这个函数，但不拥有建表权限

GRANT EXECUTE ON FUNCTION create_data_table(TEXT) TO anon;

GRANT EXECUTE ON FUNCTION create_data_table(TEXT) TO authenticated;