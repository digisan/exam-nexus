-- Supabase UI Console 执行一次创建视图即可

CREATE OR REPLACE VIEW public.user_defined_functions AS
SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS return_type
FROM
  pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
  n.nspname = 'public'
  AND p.prokind = 'f'
  AND p.oid NOT IN (SELECT aggfnoid FROM pg_aggregate)
ORDER BY
  p.proname;