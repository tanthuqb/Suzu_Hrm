set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.fn_validate_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  allowed_domains text[] := array['suzu.edu.vn', 'suzu.group'];
  domain text;
  ok boolean := false;
begin
  foreach domain in array allowed_domains loop
    if new.email ilike '%' || domain then
      ok := true;
      exit;
    end if;
  end loop;

  if not ok then
    raise exception 'Email không thuộc workspace: %', new.email;
  end if;

  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER trg_validate_email BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION auth.fn_validate_email();


