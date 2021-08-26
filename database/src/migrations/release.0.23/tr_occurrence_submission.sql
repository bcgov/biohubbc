-- tr_occurrence_submission.sql
create or replace function tr_occurrence_submission() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_occurrence_submission
-- Purpose: performs specific data validation
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-06-29  initial release
-- *******************************************************************
declare
  _data_package_id data_package.data_package_id%type;
begin
  -- ensure that submission has submission level data package identifier
  insert into data_package default values returning data_package_id into _data_package_id;

  insert into occurrence_submission_data_package (occurrence_submission_id, data_package_id) values (new.occurrence_submission_id, _data_package_id);

  return new;
end;
$$;

drop trigger if exists occurrence_submission_val on biohub.occurrence_submission;
create trigger occurrence_submission_val after insert on biohub.occurrence_submission for each row execute procedure tr_occurrence_submission();