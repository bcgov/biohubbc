-- tr_audit_trigger.sql

create or replace function tr_audit_trigger() returns trigger
language plpgsql
as
$$
declare
  v_user_id system_user.id%type;
  v_user_identity_source_id user_identity_source.id%type;
begin
  raise notice 'entering tr_audit_trigger';
  select coalesce(current_setting('biohub.user_id', true)::varchar,null) into v_user_id;

  if v_user_id is null THEN
    if (TG_TABLE_NAME = 'system_user') then
      -- avoid race condition if updating the system user table
      v_user_id = 1;
    else
      -- identify database user id
      select id into strict v_user_identity_source_id from user_identity_source
          where name = 'DATABASE'
          and record_end_date is null;

      select id into v_user_id from system_user
        where external_id = session_user
        and uis_id = v_user_identity_source_id
        and record_end_date is null;

      if (v_user_id is null) then
        -- create database system user
        -- note that we need to hard code create_user as we currently don't have a user value
        insert into system_user
          (uis_id, external_id, record_effective_date, create_user)
          VALUES
          (v_user_identity_source_id, session_user, now(), 1)
          returning id into v_user_id;
          raise notice 'setting';
          perform set_config('biohub.user_id', v_user_id::character, false);
      end if;
    end if;
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
