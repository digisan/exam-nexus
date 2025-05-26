DO $$
DECLARE
    _table_name TEXT;
BEGIN
    FOR _table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN (
              SELECT table_name
              FROM information_schema.views
              WHERE table_schema = 'public'
          )
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE;', _table_name);
    END LOOP;
END $$;
