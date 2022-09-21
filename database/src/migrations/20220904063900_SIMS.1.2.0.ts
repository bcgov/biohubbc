import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub_dapi_v1;
  drop view biohub_dapi_v1.permit;
  
  set search_path=biohub;
  
  drop function if exists tr_permit cascade;
  
  delete from permit where survey_id is null;
  
  alter table permit drop column system_user_id;
  alter table permit drop column project_id;
  
  COMMENT ON TABLE permit IS 'Provides a record of scientific permits. Note that permits are first class objects in the data model and do not require an association to either a project or survey. Additionally:
  - Association to a survey or project implies that sampling was conducted related to the permit 
  - No association to a survey or project implies that sampling was not conducted related to the permit
  - Permits can be associated with one or zero surveys across projects
  - Permits that have no association with a project or survey require values for coordinator first name, last name, email address and agency name'
  ;
  
  CREATE TABLE survey_permit(
      survey_permit_id    integer    GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      permit_id           integer    NOT NULL,
      survey_id           integer    NOT NULL,
      create_date         timestamptz(6)    DEFAULT now() NOT NULL,
      create_user         integer           NOT NULL,
      update_date         timestamptz(6),
      update_user         integer,
      revision_count      integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_permit_pk PRIMARY KEY (survey_permit_id)
  )
  ;
  
  COMMENT ON COLUMN survey_permit.survey_permit_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_permit.survey_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON TABLE biohub.survey_permit IS 'An associative entity that joins surveys and permits.'
  ;
  
  -- 
  -- INDEX: survey_permit_uk1 
  --

  CREATE UNIQUE INDEX survey_permit_uk1 ON biohub.survey_permit(permit_id, survey_id)
  ;
  -- 
  -- INDEX: "Ref133218" 
  --
  
  CREATE INDEX "Ref133218" ON biohub.survey_permit(permit_id)
  ;
  -- 
  -- INDEX: "Ref153219" 
  --
  
  CREATE INDEX "Ref153219" ON biohub.survey_permit(survey_id)
  ;
  
  ALTER TABLE biohub.survey_permit ADD CONSTRAINT "Refpermit218" 
      FOREIGN KEY (permit_id)
      REFERENCES permit(permit_id)
  ;
  
  ALTER TABLE biohub.survey_permit ADD CONSTRAINT "Refsurvey219" 
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id)
  ;
  
  create trigger audit_activity before insert or update or delete on biohub.survey_permit for each row execute procedure tr_audit_trigger();
  
  insert into survey_permit (permit_id, survey_id) select permit_id, survey_id from permit;
  
  alter table permit drop column survey_id;
  alter table permit drop column coordinator_first_name;
  alter table permit drop column coordinator_last_name;
  alter table permit drop column coordinator_email_address;
  alter table permit drop column coordinator_agency_name;
  alter table permit drop column issue_date;
  alter table permit drop column end_date;
  
  set search_path=biohub_dapi_v1;
  
  create or replace view permit as select * from biohub.permit;
  create or replace view survey_permit as select * from biohub.survey_permit;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
