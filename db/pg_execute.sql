CREATE OR REPLACE FUNCTION pg_execute(query TEXT, sql_type TEXT)

RETURNS JSON AS $$

DECLARE
  result JSON;

BEGIN

  IF sql_type = 'SELECT' THEN
    EXECUTE query INTO result;

  ELSIF sql_type = 'INSERT' THEN
    EXECUTE query;
    result := '{"status": "success", "message": "Data inserted successfully."}'::JSON;

  ELSIF sql_type = 'UPDATE' THEN
    EXECUTE query;
    result := '{"status": "success", "message": "Data updated successfully."}'::JSON;

  ELSIF sql_type = 'DELETE' THEN
    EXECUTE query;
    result := '{"status": "success", "message": "Data deleted successfully."}'::JSON;

  ELSE
    result := '{"status": "error", "message": "Unsupported query type."}'::JSON;

  END IF;

  RETURN result;

END $$ LANGUAGE plpgsql;