-- tr_journal_trigger.sql
create or replace function tr_journal_trigger() returns trigger 
language plpgsql
security definer
as 
$$
-- *******************************************************************
-- Procedure: tr_journal_trigger
-- Purpose: audits journal information during DML execution
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
-- *******************************************************************
declare
  _system_user_id system_user.system_user_id%type;
  old_row json := null;
  new_row json := null;
begin
  select api_get_context_user_id() into strict _system_user_id;
  
  if tg_op in ('UPDATE','DELETE') then
    old_row = row_to_json(old);    
  end if;
  if tg_op in ('INSERT','UPDATE') then
    new_row = row_to_json(new);
  end if;

  insert into audit_log(system_user_id,
    table_name,
    operation,
    before_value,
    after_value) 
  values (_system_user_id,
    tg_table_schema || '.' || tg_table_name,
    tg_op,
    old_row,
    new_row);

  return NEW;
end;
$$;