-- smoketest_release.sql
-- run as db super user
\c biohub

do $$
declare
  __count integer = 0;
begin
  set role postgres;
  set search_path=biohub;

  delete from system_user where user_identifier = 'myIDIR';

  insert into system_user (uis_id, user_identifier, record_effective_date) values ((select id from user_identity_source where name = 'IDIR' and record_end_date is null), 'myIDIR', now());

  select count(1) into __count from system_user;
  assert __count > 1, 'FAIL system_user';
  select count(1) into __count from audit_log;
  assert __count > 1, 'FAIL audit_log';

  -- drop security context for subsequent roles to instantiate
  drop table biohub_context_temp;
end
$$;

do $$
declare
  __p_id project.id%type;
  __s_id survey.id%type;
  __count integer = 0;
  __system_user_id system_user.id%type;
  __ss_id study_species.id%type;
begin
  set role biohub_api;
  set search_path to biohub_dapi_v1, biohub, public, topology;

  -- set security context
  select api_set_context('myIDIR', 'IDIR') into __system_user_id;
  --select api_set_context('biohub_api', 'DATABASE') into __system_user_id;

  -- test project data
  -- delete all project data
  delete from study_species;
  delete from stakeholder_partnership;
  delete from project_activity;
  delete from project_climate_initiative;
  delete from project_region;
  delete from project_permit;
  delete from project_management_actions;
  delete from project_funding_source;
  delete from project_iucn_action_classification;
  delete from project_attachment;
  delete from project_first_nation;
  delete from project;

  insert into project (pt_id
    , name
    , objectives
    , start_date
    , coordinator_first_name
    , coordinator_last_name
    , coordinator_email_address
    , coordinator_agency_name
    , coordinator_public
    , geometry
    ) values ((select id from project_type where name = 'Wildlife')
    , 'project 10'
    , 'my objectives'
    , now()
    , 'coordinator_first_name'
    , 'coordinator_last_name'
    , 'coordinator_email_address'
    , 'coordinator_agency_name'
    , TRUE
    , ST_Transform(ST_GeomFromKML('<Polygon><outerBoundaryIs><LinearRing><coordinates>-124.320874799971,48.9077923120772 -124.322396203914,48.9065111298094 -124.324678309828,48.905390095325 -124.327360785201,48.9057904647837 -124.32844178274,48.9074319795644 -124.328962263036,48.9093937899119 -124.32912241082,48.9102746027211 -124.326880341851,48.9101544918834 -124.32359731229,48.9088733096156 -124.320874799971,48.9077923120772</coordinates></LinearRing></outerBoundaryIs></Polygon>'), 3005)
    ) returning id into __p_id;

  insert into stakeholder_partnership (p_id, name) values (__p_id, 'test');
  insert into project_activity (p_id, a_id) values (__p_id, (select id from activity where name = 'Monitoring'));
  insert into project_climate_initiative (p_id, cci_id) values (__p_id, (select id from climate_change_initiative where name = 'Monitoring'));
  insert into project_region (p_id, name) values (__p_id, 'test');
  insert into project_permit (p_id, type, number, sampling_conducted) values (__p_id, 'permit type', round(random()*100000), 'Y');
  insert into project_management_actions (p_id, mat_id) values (__p_id, (select id from management_action_type where name = 'Recovery Action'));
  insert into project_funding_source (p_id, iac_id, funding_amount, funding_start_date, funding_end_date, funding_source_project_id) values (__p_id, (select id from investment_action_category where name = 'Action 1'), '$1,000.00', now(), now(), 'test');
  --insert into project_funding_source (p_id, iac_id, funding_amount, funding_start_date, funding_end_date) values (__p_id, 43, '$1,000.00', now(), now());
  insert into project_iucn_action_classification (p_id, iucn3_id) values (__p_id, (select id from iucn_conservation_action_level_2_subclassification where name = 'Species Stewardship'));
  insert into project_attachment (p_id, file_name, title, key, file_size) values (__p_id, 'test_filename.txt', 'test filename', 'projects/'||__p_id::text, 10000);
  insert into project_first_nation (p_id, fn_id) values (__p_id, (select id from first_nations where name = 'Kitselas Nation'));

  select count(1) into __count from stakeholder_partnership;
  assert __count = 1, 'FAIL stakeholder_partnership';
  select count(1) into __count from project_activity;
  assert __count = 1, 'FAIL project_activity';
  select count(1) into __count from project_climate_initiative;
  assert __count = 1, 'FAIL project_climate_initiative';
  select count(1) into __count from project_region;
  assert __count = 1, 'FAIL project_region';
  select count(1) into __count from project_permit;
  assert __count = 1, 'FAIL project_permit';
  select count(1) into __count from project_management_actions;
  assert __count = 1, 'FAIL project_management_actions';
  select count(1) into __count from project_funding_source;
  assert __count = 1, 'FAIL project_funding_source';
  select count(1) into __count from project_iucn_action_classification;
  assert __count = 1, 'FAIL project_iucn_action_classification';
  select count(1) into __count from project_attachment;
  assert __count = 1, 'FAIL project_attachment';
  select count(1) into __count from project_first_nation;
  assert __count = 1, 'FAIL project_first_nation';

  -- surveys
  insert into survey (p_id, name, objectives, location_name, location_description, start_date, lead_first_name, lead_last_name, geometry)
    values (__p_id, 'survey name', 'survey objectives', 'survey location name', 'survey location description', now(), 'lead first', 'lead last', ST_Transform(ST_GeomFromKML('<Polygon><outerBoundaryIs><LinearRing><coordinates>-124.320874799971,48.9077923120772 -124.322396203914,48.9065111298094 -124.324678309828,48.905390095325 -124.327360785201,48.9057904647837 -124.32844178274,48.9074319795644 -124.328962263036,48.9093937899119 -124.32912241082,48.9102746027211 -124.326880341851,48.9101544918834 -124.32359731229,48.9088733096156 -124.320874799971,48.9077923120772</coordinates></LinearRing></outerBoundaryIs></Polygon>'), 3005)) returning id into __s_id;
  select count(1) into __count from survey;
  assert __count = 1, 'FAIL survey';
  insert into survey_proprietor (s_id, fn_id, prt_id, rationale,disa_required)
    values (__s_id, (select id from first_nations where name = 'Squamish Nation'), (select id from proprietor_type where name = 'First Nations Land'), 'proprietor rationale', true);
  select count(1) into __count from survey_proprietor;
  assert __count = 1, 'FAIL survey_proprietor';
  insert into survey_attachment (s_id, file_name, title, key, file_size) values (__s_id, 'test_filename.txt', 'test filename', 'projects/'||__p_id::text||'/surveys/'||__s_id::text, 10000);
  select count(1) into __count from survey_attachment where s_id = __s_id;
  assert __count = 1, 'FAIL survey_attachment';
  insert into study_species (s_id, wu_id, is_focal) values (__s_id, (select id from wldtaxonomic_units where CODE = 'AMARALB'), true);
  select count(1) into __count from study_species;
  assert __count = 1, 'FAIL study_species';

  -- test ancillary data
  delete from webform_draft;
  insert into webform_draft (su_id, name, data) values ((select id from system_user limit 1), 'my draft name', '{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}');
  select count(1) into __count from webform_draft;
  assert __count = 1, 'FAIL webform_draft';

  -- work ledger
  delete from administrative_activity;
  insert into administrative_activity (reported_su_id
    , aat_id
    , aast_id
    , description
    , data)
    values (__system_user_id
    , (select id from administrative_activity_type where name = 'System Access')
    , (select id from administrative_activity_status_type where name = 'Pending')
    , 'my activity'
    , '{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}')
  ;
  select count(1) into __count from administrative_activity;
  assert __count = 1, 'FAIL administrative_activity';

  -- delete project
  call api_delete_project(__p_id);
end
$$;

delete from administrative_activity;