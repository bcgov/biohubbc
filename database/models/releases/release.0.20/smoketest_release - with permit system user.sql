-- smoketest_release.sql
-- run as db super user
\c biohub

do $$
declare
  _count integer = 0;
begin
  set role postgres;
  set search_path=biohub;

  delete from system_user where user_identifier = 'myIDIR';

  insert into system_user (user_identity_source_id, user_identifier, record_effective_date) values ((select user_identity_source_id from user_identity_source where name = 'IDIR' and record_end_date is null), 'myIDIR', now());

  select count(1) into _count from system_user;
  assert _count > 1, 'FAIL system_user';
  select count(1) into _count from audit_log;
  assert _count > 1, 'FAIL audit_log';

  -- drop security context for subsequent roles to instantiate
  drop table biohub_context_temp;
end
$$;

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
begin
  set role biohub_api;
  set search_path to biohub_dapi_v1, biohub, public, topology;

  -- set security context
  select api_set_context('myIDIR', 'IDIR') into _system_user_id;
  --select api_set_context('biohub_api', 'DATABASE') into _system_user_id;

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
    , geometry
    ) values ((select project_type_id from project_type where name = 'Wildlife')
    , 'project 10'
    , 'my objectives'
    , now()
    , now()+interval '1 day'
    , 'coordinator_first_name'
    , 'coordinator_last_name'
    , 'coordinator_email_address'
    , 'coordinator_agency_name'
    , TRUE
    , ST_Transform(ST_GeomFromKML('<Polygon><outerBoundaryIs><LinearRing><coordinates>-124.320874799971,48.9077923120772 -124.322396203914,48.9065111298094 -124.324678309828,48.905390095325 -124.327360785201,48.9057904647837 -124.32844178274,48.9074319795644 -124.328962263036,48.9093937899119 -124.32912241082,48.9102746027211 -124.326880341851,48.9101544918834 -124.32359731229,48.9088733096156 -124.320874799971,48.9077923120772</coordinates></LinearRing></outerBoundaryIs></Polygon>'), 3005)
    ) returning project_id into _project_id;

  insert into stakeholder_partnership (project_id, name) values (_project_id, 'test');
  insert into project_activity (project_id, activity_id) values (_project_id, (select activity_id from activity where name = 'Monitoring'));
  insert into project_climate_initiative (project_id, climate_change_initiative_id) values (_project_id, (select climate_change_initiative_id from climate_change_initiative where name = 'Monitoring'));
  insert into project_region (project_id, name) values (_project_id, 'test');
  insert into project_management_actions (project_id, management_action_type_id) values (_project_id, (select management_action_type_id from management_action_type where name = 'Recovery Action'));
  insert into project_funding_source (project_id, investment_action_category_id, funding_amount, funding_start_date, funding_end_date, funding_source_project_id) values (_project_id, (select investment_action_category_id from investment_action_category where name = 'Action 1'), '$1,000.00', now(), now(), 'test');
  --insert into project_funding_source (project_id, investment_action_category_id, funding_amount, funding_start_date, funding_end_date) values (_project_id, 43, '$1,000.00', now(), now());
  insert into project_iucn_action_classification (project_id, iucn_conservation_action_level_3_subclassification_id) values (_project_id, (select iucn_conservation_action_level_3_subclassification_id from iucn_conservation_action_level_3_subclassification where name = 'Primary education'));
  insert into project_attachment (project_id, file_name, title, key, file_size) values (_project_id, 'test_filename.txt', 'test filename', 'projects/'||_project_id::text, 10000);
  insert into project_first_nation (project_id, first_nations_id) values (_project_id, (select first_nations_id from first_nations where name = 'Kitselas Nation'));
  insert into permit (system_user_id, project_id, number, type, issue_date, end_date) values (_system_user_id, _project_id, '8377262', 'permit type', now(), now()+interval '1 day');

  select count(1) into _count from stakeholder_partnership;
  assert _count = 1, 'FAIL stakeholder_partnership';
  select count(1) into _count from project_activity;
  assert _count = 1, 'FAIL project_activity';
  select count(1) into _count from project_climate_initiative;
  assert _count = 1, 'FAIL project_climate_initiative';
  select count(1) into _count from project_region;
  assert _count = 1, 'FAIL project_region';
  select count(1) into _count from project_management_actions;
  assert _count = 1, 'FAIL project_management_actions';
  select count(1) into _count from project_funding_source;
  assert _count = 1, 'FAIL project_funding_source';
  select count(1) into _count from project_iucn_action_classification;
  assert _count = 1, 'FAIL project_iucn_action_classification';
  select count(1) into _count from project_attachment;
  assert _count = 1, 'FAIL project_attachment';
  select count(1) into _count from project_first_nation;
  assert _count = 1, 'FAIL project_first_nation';
  select count(1) into _count from permit;
  assert _count = 1, 'FAIL permit';

  -- surveys
  insert into survey (project_id, name, objectives, location_name, location_description, start_date, lead_first_name, lead_last_name, geometry)
    values (_project_id, 'survey name', 'survey objectives', 'survey location name', 'survey location description', now(), 'lead first', 'lead last', ST_Transform(ST_GeomFromKML('<Polygon><outerBoundaryIs><LinearRing><coordinates>-124.320874799971,48.9077923120772 -124.322396203914,48.9065111298094 -124.324678309828,48.905390095325 -124.327360785201,48.9057904647837 -124.32844178274,48.9074319795644 -124.328962263036,48.9093937899119 -124.32912241082,48.9102746027211 -124.326880341851,48.9101544918834 -124.32359731229,48.9088733096156 -124.320874799971,48.9077923120772</coordinates></LinearRing></outerBoundaryIs></Polygon>'), 3005)) returning survey_id into _survey_id;
  select count(1) into _count from survey;
  assert _count = 1, 'FAIL survey';
  insert into survey_proprietor (survey_id, first_nations_id, proprietor_type_id, rationale,disa_required)
    values (_survey_id, (select first_nations_id from first_nations where name = 'Squamish Nation'), (select proprietor_type_id from proprietor_type where name = 'First Nations Land'), 'proprietor rationale', true);
  select count(1) into _count from survey_proprietor;
  assert _count = 1, 'FAIL survey_proprietor';
  insert into survey_attachment (survey_id, file_name, title, key, file_size) values (_survey_id, 'test_filename.txt', 'test filename', 'projects/'||_project_id::text||'/surveys/'||_survey_id::text, 10000);
  select count(1) into _count from survey_attachment where survey_id = _survey_id;
  assert _count = 1, 'FAIL survey_attachment';
  insert into study_species (survey_id, wldtaxonomic_units_id, is_focal) values (_survey_id, (select wldtaxonomic_units_id from wldtaxonomic_units where CODE = 'AMARALB'), true);
  select count(1) into _count from study_species;
  assert _count = 1, 'FAIL study_species';

  -- occurrence
  -- occurrence submission 1
  insert into occurrence_submission (survey_id, source, event_timestamp) values (_survey_id, 'BIOHUB BATCH', now()-interval '1 day') returning occurrence_submission_id into _occurrence_submission_id;
  select count(1) into _count from occurrence_submission;
  assert _count = 1, 'FAIL occurrence_submission';
  insert into occurrence (occurrence_submission_id, taxonid, lifestage, eventdate) values (_occurrence_submission_id, 'M-ALAL', 'Adult', now()-interval '10 day');
  select count(1) into _count from occurrence;
  assert _count = 1, 'FAIL occurrence';
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Submitted'), now()-interval '1 day') returning submission_status_id into _submission_status_id;
  insert into submission_message (submission_status_id, submission_message_type_id, event_timestamp, message) values (_submission_status_id, (select submission_message_type_id from submission_message_type where name = 'Notice'), now()-interval '1 day', 'A notice message at stage submitted.');
  -- transpose comments on next three lines to test deletion of published surveys by system administrator
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Awaiting Curration'), now()-interval '1 day') returning submission_status_id into _submission_status_id;
  --insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Published'), now()-interval '1 day') returning id into _submission_status_id;
  --insert into system_user_role (system_user_id, system_role_id) values (_system_user_id, (select system_role_id from system_role where name = 'System Administrator'));
  insert into submission_message (submission_status_id, submission_message_type_id, event_timestamp, message) values (_submission_status_id, (select submission_message_type_id from submission_message_type where name = 'Notice'), now()-interval '1 day', 'A notice message at stage published.');

  -- occurrence submission 2
  insert into occurrence_submission (survey_id, source, event_timestamp) values (_survey_id, 'BIOHUB BATCH', now()) returning occurrence_submission_id into _occurrence_submission_id;
  select count(1) into _count from occurrence_submission;
  assert _count = 2, 'FAIL occurrence_submission';
  insert into occurrence (occurrence_submission_id, taxonid, lifestage, eventdate) values (_occurrence_submission_id, 'M-ALAL', 'Adult', now()-interval '5 day');
  select count(1) into _count from occurrence;
  assert _count = 2, 'FAIL occurrence';
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Submitted'), now()) returning submission_status_id into _submission_status_id;
  insert into submission_message (submission_status_id, submission_message_type_id, event_timestamp, message) values (_submission_status_id, (select submission_message_type_id from submission_message_type where name = 'Notice'), now(), 'A notice message at stage submitted.');
  insert into submission_status (occurrence_submission_id, submission_status_type_id, event_timestamp) values (_occurrence_submission_id, (select submission_status_type_id from submission_status_type where name = 'Rejected'), now()) returning submission_status_id into _submission_status_id;
  insert into submission_message (submission_status_id, submission_message_type_id, event_timestamp, message) values (_submission_status_id, (select submission_message_type_id from submission_message_type where name = 'Notice'), now(), 'A notice message at stage published.');
  select count(1) into _count from submission_status;
  assert _count = 4, 'FAIL submission_status';
  select count(1) into _count from submission_message;
  assert _count = 4, 'FAIL submission_message';  

  raise notice 'survey status (project_id, survey_id, survey_status):';
  for _survey_status_rec in execute _survey_status_query loop
    raise notice 'survey status results are % % %', _survey_status_rec.project_id, _survey_status_rec.survey_id, _survey_status_rec.survey_status;
  end loop;

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
  call api_delete_project(_project_id);

  raise notice 'smoketest_release: PASS';
end
$$;

delete from administrative_activity;
delete from permit;