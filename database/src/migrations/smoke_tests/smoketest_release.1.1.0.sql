-- run as db super user
\c biohub
set role postgres;
set search_path=biohub;

do $$
declare
  _count integer = 0;
  _system_user system_user%rowtype;
  _system_user_id system_user.system_user_id%type;
begin
  select * into _system_user from system_user where user_identifier = 'myIDIR';
  if _system_user.system_user_id is not null then
    delete from permit where system_user_id = _system_user.system_user_id;
    delete from administrative_activity where reported_system_user_id = _system_user.system_user_id;
    delete from administrative_activity where assigned_system_user_id = _system_user.system_user_id;
    delete from system_user_role where system_user_id = _system_user.system_user_id;
    delete from system_user where system_user_id = _system_user.system_user_id;
  end if;

  insert into system_user (user_identity_source_id, user_identifier, record_effective_date) values ((select user_identity_source_id from user_identity_source where name = 'IDIR' and record_end_date is null), 'myIDIR', now()) returning system_user_id into _system_user_id;
  insert into system_user_role (system_user_id, system_role_id) values (_system_user_id, (select system_role_id from system_role where name =  'System Administrator'));

  select count(1) into _count from system_user;
  assert _count > 1, 'FAIL system_user';
  select count(1) into _count from audit_log;
  assert _count > 1, 'FAIL audit_log';

  -- drop security context for subsequent roles to instantiate
  drop table biohub_context_temp;

  raise notice 'smoketest_release(1): PASS';
end
$$;

set role biohub_api;
set search_path to biohub_dapi_v1, biohub, public, topology;
do $$
declare
  _project_id project.project_id%type;
  _survey_id survey.survey_id%type;
  _count integer = 0;
  _system_user_id system_user.system_user_id%type;
  _study_species_id study_species.study_species_id%type;
  _occurrence_submission_id occurrence_submission.occurrence_submission_id%type;
  _submission_status_id submission_status.submission_status_id%type;
  _survey_status_query text := 'select project_id, survey_id, survey_status from survey_status';
  _survey_status_rec survey_status%rowtype;
  _geography project.geography%type;
  _project_funding_source_id project_funding_source.project_funding_source_id%type;
  _project_report_attachment_id project_report_attachment.project_report_attachment_id%type;
  _survey_report_attachment_id survey_report_attachment.survey_report_attachment_id%type;
begin
  -- set security context
  select api_set_context('myIDIR', 'IDIR') into _system_user_id;
  --select api_set_context('biohub_api', 'DATABASE') into _system_user_id;

  select st_GeomFromEWKT('SRID=4326;POLYGON((-123.920288 48.592142,-123.667603 48.645205,-123.539886 48.536204,-123.583832 48.46978,-123.728027 48.460674,-123.868103 48.467959,-123.940887 48.5262,-123.920288 48.592142), (-103.920288 38.592142,-103.667603 38.645205,-103.539886 38.536204,-103.583832 38.46978,-103.728027 38.460674,-103.868103 38.467959,-103.940887 38.5262,-103.920288 38.592142))') into _geography;

  insert into project (project_type_id
    , name
    , objectives
    , start_date
    , end_date
    , coordinator_first_name
    , coordinator_last_name
    , coordinator_email_address
    , coordinator_agency_name
    , coordinator_public
    , geography
    ) values ((select project_type_id from project_type where name = 'Wildlife')
    , 'project 10'
    , 'my objectives'
    , now()
    , now()+interval '1 day'
    , 'coordinator_first_name'
    , 'coordinator_last_name'
    , 'coordinator_email_address@nowhere.com'
    , 'coordinator_agency_name'
    , TRUE
    , _geography
    ) returning project_id into _project_id;

  insert into stakeholder_partnership (project_id, name) values (_project_id, 'test');
  insert into project_activity (project_id, activity_id) values (_project_id, (select activity_id from activity where name = 'Monitoring'));
  insert into project_climate_initiative (project_id, climate_change_initiative_id) values (_project_id, (select climate_change_initiative_id from climate_change_initiative where name = 'Monitoring'));
  insert into project_management_actions (project_id, management_action_type_id) values (_project_id, (select management_action_type_id from management_action_type where name = 'Recovery Action'));
  insert into project_funding_source (project_id, investment_action_category_id, funding_amount, funding_start_date, funding_end_date, funding_source_project_id) values (_project_id, (select investment_action_category_id from investment_action_category where name = 'Action 1'), '$1,000.00', now(), now(), 'test') returning project_funding_source_id into _project_funding_source_id;
  --insert into project_funding_source (project_id, investment_action_category_id, funding_amount, funding_start_date, funding_end_date) values (_project_id, 43, '$1,000.00', now(), now());
  insert into project_iucn_action_classification (project_id, iucn_conservation_action_level_3_subclassification_id) values (_project_id, (select iucn_conservation_action_level_3_subclassification_id from iucn_conservation_action_level_3_subclassification where name = 'Primary Education'));
  insert into project_attachment (project_id, file_name, title, key, file_size, file_type) values (_project_id, 'test_filename.txt', 'test filename', 'projects/'||_project_id::text, 10000, 'video');
  insert into project_report_attachment (project_id, file_name, title, key, file_size, year, description) values (_project_id, 'test_filename.txt', 'test filename', 'projects/'||_project_id::text, 10000, '2021', 'example abstract') returning project_report_attachment_id into _project_report_attachment_id;
  insert into project_report_author (project_report_attachment_id, first_name, last_name) values (_project_report_attachment_id, 'john', 'doe');
  insert into project_report_author (project_report_attachment_id, first_name, last_name) values (_project_report_attachment_id, 'bob', 'dole');
  insert into project_first_nation (project_id, first_nations_id) values (_project_id, (select first_nations_id from first_nations where name = 'Kitselas Nation'));
  insert into permit (system_user_id, project_id, number, type, issue_date, end_date) values (_system_user_id, _project_id, '8377262', 'permit type', now(), now()+interval '1 day');

  select count(1) into _count from stakeholder_partnership;
  assert _count = 1, 'FAIL stakeholder_partnership';
  select count(1) into _count from project_activity;
  assert _count = 1, 'FAIL project_activity';
  select count(1) into _count from project_climate_initiative;
  assert _count = 1, 'FAIL project_climate_initiative';
  select count(1) into _count from project_management_actions;
  assert _count = 1, 'FAIL project_management_actions';
  select count(1) into _count from project_funding_source;
  assert _count = 1, 'FAIL project_funding_source';
  select count(1) into _count from project_iucn_action_classification;
  assert _count = 1, 'FAIL project_iucn_action_classification';
  select count(1) into _count from project_attachment;
  assert _count = 1, 'FAIL project_attachment';
  select count(1) into _count from project_attachment;
  assert _count = 1, 'FAIL project_attachment';
  select count(1) into _count from project_report_attachment;
  assert _count = 1, 'FAIL project_report_attachment';
  select count(1) into _count from project_report_author;
  assert _count = 2, 'FAIL project_report_author';
  select count(1) into _count from project_first_nation;
  assert _count = 1, 'FAIL project_first_nation';
  select count(1) into _count from permit;
  assert _count = 1, 'FAIL permit';

  -- surveys
  insert into survey (project_id
    , name
    , additional_details
    , location_name
    , location_description
    , start_date
    , lead_first_name
    , lead_last_name
    , geography
    , ecological_season_id
    , intended_outcome_id)
  values (_project_id
    , 'survey name'
    , 'survey objectives'
    , 'survey location name'
    , 'survey location description'
    , now()
    , 'lead first'
    , 'lead last'
    , _geography
    , (select ecological_season_id from ecological_season where name = 'Growing')
    , (select intended_outcome_id from intended_outcome where name = 'Survival')    
    ) returning survey_id into _survey_id;

  insert into survey_proprietor (survey_id, first_nations_id, proprietor_type_id, rationale,disa_required)
    values (_survey_id, (select first_nations_id from first_nations where name = 'Squamish Nation'), (select proprietor_type_id from proprietor_type where name = 'First Nations Land'), 'proprietor rationale', true);  
  insert into survey_attachment (survey_id, file_name, title, key, file_size, file_type) values (_survey_id, 'test_filename.txt', 'test filename', 'projects/'||_project_id::text||'/surveys/'||_survey_id::text, 10000, 'video');
  insert into survey_report_attachment (survey_id, file_name, title, key, file_size, year, description) values (_survey_id, 'test_filename.txt', 'test filename', 'projects/'||_survey_id::text, 10000, '2021', 'example abstract') returning survey_report_attachment_id into _survey_report_attachment_id;
  insert into survey_report_author (survey_report_attachment_id, first_name, last_name) values (_survey_report_attachment_id, 'john', 'doe');
  insert into survey_report_author (survey_report_attachment_id, first_name, last_name) values (_survey_report_attachment_id, 'bob', 'dole');
  insert into study_species (survey_id, wldtaxonomic_units_id, is_focal) values (_survey_id, (select wldtaxonomic_units_id from wldtaxonomic_units where CODE = 'AMARALB'), true);
  insert into survey_funding_source (survey_id, project_funding_source_id) values (_survey_id, _project_funding_source_id);
  insert into survey_vantage(survey_id, vantage_id) values (_survey_id, (select vantage_id from vantage where name = 'Aerial'));

  select count(1) into _count from survey;
  assert _count = 1, 'FAIL survey';
  select count(1) into _count from survey_proprietor;
  assert _count = 1, 'FAIL survey_proprietor';
  select count(1) into _count from survey_attachment where survey_id = _survey_id;
  assert _count = 1, 'FAIL survey_attachment';  
  select count(1) into _count from survey_report_attachment;
  assert _count = 1, 'FAIL survey_report_attachment';    
  select count(1) into _count from survey_report_author;
  assert _count = 2, 'FAIL survey_report_author';  
  select count(1) into _count from study_species;
  assert _count = 1, 'FAIL study_species';  
  select count(1) into _count from survey_funding_source;
  assert _count = 1, 'FAIL survey_funding_source';  
  select count(1) into _count from survey_vantage;
  assert _count = 1, 'FAIL survey_vantage';  

  -- occurrence
  -- occurrence submission 1
  insert into occurrence_submission (survey_id, source, event_timestamp) values (_survey_id, 'BIOHUB BATCH', now()-interval '1 day') returning occurrence_submission_id into _occurrence_submission_id;
  select count(1) into _count from occurrence_submission;
  assert _count = 1, 'FAIL occurrence_submission';
  insert into occurrence (occurrence_submission_id, taxonid, lifestage, eventdate, sex) values (_occurrence_submission_id, 'M-ALAL', 'Adult', now()-interval '10 day', 'male');
  select count(1) into _count from occurrence;
  assert _count = 1, 'FAIL occurrence';
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Submitted'), now()-interval '1 day') returning submission_status_id into _submission_status_id;
  -- transpose comments on next three lines to test deletion of published surveys by system administrator
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Awaiting Curration'), now()-interval '1 day') returning submission_status_id into _submission_status_id;
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Published'), now()-interval '1 day') returning submission_status_id into _submission_status_id;
  --insert into system_user_role (system_user_id, system_role_id) values (_system_user_id, (select system_role_id from system_role where name = 'System Administrator'));
  
  -- occurrence submission 2
  insert into occurrence_submission (survey_id, source, event_timestamp) values (_survey_id, 'BIOHUB BATCH', now()) returning occurrence_submission_id into _occurrence_submission_id;
  select count(1) into _count from occurrence_submission;
  assert _count = 2, 'FAIL occurrence_submission';
  insert into occurrence (occurrence_submission_id, taxonid, lifestage, eventdate, sex) values (_occurrence_submission_id, 'M-ALAL', 'Adult', now()-interval '5 day', 'female');
  select count(1) into _count from occurrence;
  assert _count = 2, 'FAIL occurrence';
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Submitted'), now()) returning submission_status_id into _submission_status_id;
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Rejected'), now()) returning submission_status_id into _submission_status_id;
  insert into submission_message (submission_status_id, submission_message_type_id, event_timestamp, message) values (_submission_status_id, (select submission_message_type_id from submission_message_type where name = 'Missing Required Field'), now(), 'Some required field was not supplied.');
  select count(1) into _count from submission_status;
  assert _count = 5, 'FAIL submission_status';
  select count(1) into _count from submission_message;
  assert _count = 1, 'FAIL submission_message';  

--  raise notice 'survey status (project_id, survey_id, survey_status):';
--  for _survey_status_rec in execute _survey_status_query loop
--    raise notice 'survey status results are % % % %', _survey_status_rec.project_id, _survey_status_rec.survey_id,  _survey_status_rec.occurrence_id, _survey_status_rec.survey_status;
--  end loop;

  -- test ancillary data
  delete from webform_draft;
  insert into webform_draft (system_user_id, name, data) values ((select system_user_id from system_user limit 1), 'my draft name', '{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}');
  select count(1) into _count from webform_draft;
  assert _count = 1, 'FAIL webform_draft';

  -- work ledger
  delete from administrative_activity;
  insert into administrative_activity (reported_system_user_id
    , administrative_activity_type_id
    , administrative_activity_status_type_id
    , description
    , data)
    values (_system_user_id
    , (select administrative_activity_type_id from administrative_activity_type where name = 'System Access')
    , (select administrative_activity_status_type_id from administrative_activity_status_type where name = 'Pending')
    , 'my activity'
    , '{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}')
  ;
  select count(1) into _count from administrative_activity;
  assert _count = 1, 'FAIL administrative_activity';

  insert into permit (system_user_id, number, type, issue_date, end_date, coordinator_first_name, coordinator_last_name, coordinator_email_address, coordinator_agency_name) values (_system_user_id, '8377261', 'permit type', now(), now()+interval '1 day', 'first', 'last', 'nobody@nowhere.com', 'agency');

  -- delete project
  raise notice 'deleting data.';
  call api_delete_project(_project_id);

  raise notice 'smoketest_release(2): PASS';
end
$$;

delete from permit;
