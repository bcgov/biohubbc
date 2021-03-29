-- smoketest_release.0.7.sql

-- following to be run as postgres user
set search_path=biohub;
insert into system_user (uis_id, user_identifier, record_effective_date, create_date, create_user)
  select id, 'myIDIR', now(), now(), 1 from user_identity_source 
    where name = 'IDIR'
    and record_end_date is null;

select count(1) from audit_log;

-- following to be run as biohub_api user
set role biohub_api;
set search_path to biohub_dapi_v1, biohub, public, topology;

select api_set_context('myIDIR', null);

insert into system_constant(constant_name, character_value) values ('CONSTANT_ONE', 'constant_one');
insert into system_constant(constant_name, numeric_value) values ('CONSTANT_TWO', 1);

do $$
declare
  __id integer;
begin
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
    ) returning id into __id;

  insert into focal_species (p_id, name) values (__id, 'test');
  insert into ancillary_species (p_id, name) values (__id, 'test');
  insert into stakeholder_partnership (p_id, name) values (__id, 'test');
  insert into project_activity (p_id, a_id) values (__id, (select id from activity where name = 'Monitoring'));
  insert into project_climate_initiative (p_id, cci_id) values (__id, (select id from climate_change_initiative where name = 'Monitoring'));
  insert into project_region (p_id, name) values (__id, 'test');
  insert into project_permit (p_id, number, sampling_conducted) values (__id, random(), 'Y');
  insert into project_management_actions (p_id, mat_id) values (__id, (select id from management_action_type where name = 'Recovery Action'));
  insert into project_funding_source (p_id, iac_id, funding_amount, funding_start_date, funding_end_date, funding_source_project_id) values (__id, (select id from investment_action_category where name = 'Action 1'), '$1,000.00', now(), now(), 'test');
  --insert into project_funding_source (p_id, iac_id, funding_amount, funding_start_date, funding_end_date) values (__id, 43, '$1,000.00', now(), now());
  insert into project_iucn_action_classification (p_id, iucn3_id) values (__id, (select id from iucn_conservation_action_level_2_subclassification where name = 'Species Stewardship'));
  insert into project_attachment (p_id, file_name, title) values (__id, 'test_filename.txt', 'test filename');
end
$$;

insert into webform_draft (su_id, name, data)
  values ((select id from system_user limit 1), 'my draft name','{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}');

select count(1) from project;
select count(1) from focal_species;
select count(1) from ancillary_species;
select count(1) from stakeholder_partnership;
select count(1) from project_activity;
select count(1) from project_climate_initiative;
select count(1) from project_region;
select count(1) from project_permit;
select count(1) from project_management_actions;
select count(1) from project_funding_source;
select count(1) from project_iucn_action_classification;
select count(1) from project_attachment;
select count(1) from system_constant;
select count(1) from webform_draft;

