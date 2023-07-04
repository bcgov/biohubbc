set search_path=biohub_dapi_v1;
drop view biohub_dapi_v1.permit;

set search_path=biohub;

drop function if exists tr_permit cascade;

drop index permit_uk1;
create unique index on permit(survey_id, number);
alter table permit drop column system_user_id;
alter table permit drop column project_id;
alter table permit drop column coordinator_first_name;
alter table permit drop column coordinator_last_name;
alter table permit drop column coordinator_email_address;
alter table permit drop column coordinator_agency_name;
alter table permit drop column issue_date;
alter table permit drop column end_date;

COMMENT ON TABLE permit IS 'Provides a record of scientific permits.'
;
  
set search_path=biohub_dapi_v1;

create or replace view permit as select * from biohub.permit;
