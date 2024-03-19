-- tr_audit_trigger.sql
create or replace function tr_audit_trigger() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_audit_trigger
-- Purpose: audits user and date information during DML execution
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
-- *******************************************************************
declare
  v_user_id system_user.id%type;
  v_user_identity_source_id user_identity_source.id%type;
begin
  -- api users will hopefully have created the temp table using an api helper function
  -- this create temp table statement is for database users
  create temp table if not exists biohub_context_temp (tag varchar(200), value varchar(200));
  select value::integer into v_user_id from biohub_context_temp where tag = 'user_id';

  if (v_user_id is null) THEN    
    -- look up the database user
    select a.id into strict v_user_id from system_user a, user_identity_source b
      where a.uis_id = b.id
      and b.name = 'DATABASE'
      and user_identifier = user;
      
    -- populate for subsequent calls
    insert into biohub_context_temp (tag, value) values ('user_id', v_user_id::varchar(200));
  end if;

  if (TG_OP = 'INSERT') then
    new.create_user = v_user_id;
  elsif (TG_OP = 'UPDATE') then
    new.update_user = v_user_id;
    new.update_date = now();
    -- create audit fields are immutable
    new.create_user = old.create_user;
    new.create_date = old.create_date;
  end if;

  -- concurrency
  if (tg_op = 'UPDATE') then
    if (new.revision_count != old.revision_count) THEN
      raise exception 'CONCURRENCY_EXCEPTION';
    else
      new.revision_count = (old.revision_count + 1);
    end if;
  end if;
  
  if (tg_op = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
exception
  when others THEN
    raise;
end;
$$;
