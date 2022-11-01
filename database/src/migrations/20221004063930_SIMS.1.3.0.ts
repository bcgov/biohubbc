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
  drop view template_methodology_species;
  drop view survey_summary_detail;
  drop view survey_summary_submission;

  set search_path=biohub;

  alter table template_methodology_species alter column field_method_id drop not null;
  alter table template_methodology_species add column wldtaxonomic_units_id integer;
  COMMENT ON COLUMN template_methodology_species.wldtaxonomic_units_id IS 'System generated UID for a taxon.';

  CREATE UNIQUE INDEX template_methodology_species_nuk1 ON template_methodology_species(template_id, (field_method_id is null), (intended_outcome_id is null), (wldtaxonomic_units_id is null)) 
    where field_method_id is null and intended_outcome_id is null and wldtaxonomic_units_id is null;
    
  CREATE INDEX "Ref160218" ON template_methodology_species(wldtaxonomic_units_id);

  ALTER TABLE template_methodology_species ADD CONSTRAINT "Refwldtaxonomic_units218" 
      FOREIGN KEY (wldtaxonomic_units_id)
      REFERENCES wldtaxonomic_units(wldtaxonomic_units_id);

  drop table if exists survey_summary_detail;

  CREATE TABLE summary_template(
      summary_template_id      integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(300)      NOT NULL,
      version                  varchar(50)       NOT NULL,
      record_effective_date    date              NOT NULL,
      record_end_date          date,
      description              varchar(3000)     NOT NULL,
      key                      varchar(1000),
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT summary_template_pk PRIMARY KEY (summary_template_id)
  )
  ;

  COMMENT ON COLUMN summary_template.summary_template_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN summary_template.name IS 'The name of the record.'
  ;
  COMMENT ON COLUMN summary_template.version IS 'The version of the record.'
  ;
  COMMENT ON COLUMN summary_template.record_effective_date IS 'Record level effective date.'
  ;
  COMMENT ON COLUMN summary_template.record_end_date IS 'Record level end date.'
  ;
  COMMENT ON COLUMN summary_template.description IS 'The description of the record.'
  ;
  COMMENT ON COLUMN summary_template.key IS 'The identifying key to the file in the storage system.'
  ;
  COMMENT ON COLUMN summary_template.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN summary_template.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN summary_template.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN summary_template.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN summary_template.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE summary_template IS 'A summary template describes a summary data submission format that supports a species. Template information will include a schema that defines what code classes (headers), code values and their descriptions as well as formating and validation rules.'
  ;

  CREATE TABLE summary_template_species(
      summary_template_species_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      summary_template_id            integer           NOT NULL,
      wldtaxonomic_units_id          integer,
      validation                     json,
      create_date                    timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                    integer           NOT NULL,
      update_date                    timestamptz(6),
      update_user                    integer,
      revision_count                 integer           DEFAULT 0 NOT NULL,
      CONSTRAINT summary_template_species_pk PRIMARY KEY (summary_template_species_id)
  )
  ;

  COMMENT ON COLUMN summary_template_species.summary_template_species_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN summary_template_species.summary_template_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN summary_template_species.wldtaxonomic_units_id IS 'System generated UID for a taxon.'
  ;
  COMMENT ON COLUMN summary_template_species.validation IS 'A JSON data structure that encapsulates all template validation descriptions suitable for consumption by validation logic.'
  ;
  COMMENT ON COLUMN summary_template_species.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN summary_template_species.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN summary_template_species.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN summary_template_species.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN summary_template_species.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE summary_template_species IS 'Intersection table associating summary templates with taxonomic units.'
  ;

  alter table survey_summary_submission add column summary_template_species_id integer;

  COMMENT ON COLUMN survey_summary_submission.summary_template_species_id IS 'System generated surrogate primary key identifier.'
  ;

  CREATE UNIQUE INDEX summary_template_nuk1 ON summary_template(name, version, (record_end_date is NULL)) where record_end_date is null
  ;
  CREATE UNIQUE INDEX summary_template_species_nuk1 ON summary_template_species(summary_template_id, wldtaxonomic_units_id)
  ;
  CREATE INDEX "Ref225219" ON summary_template_species(summary_template_id)
  ;
  CREATE INDEX "Ref160220" ON summary_template_species(wldtaxonomic_units_id)
  ;
  CREATE INDEX "Ref226221" ON survey_summary_submission(summary_template_species_id)
  ;

  ALTER TABLE summary_template_species ADD CONSTRAINT "Refsummary_template219" 
      FOREIGN KEY (summary_template_id)
      REFERENCES summary_template(summary_template_id)
  ;
  ALTER TABLE summary_template_species ADD CONSTRAINT "Refwldtaxonomic_units220" 
      FOREIGN KEY (wldtaxonomic_units_id)
      REFERENCES wldtaxonomic_units(wldtaxonomic_units_id)
  ;
  ALTER TABLE survey_summary_submission ADD CONSTRAINT "Refsummary_template_species221" 
      FOREIGN KEY (summary_template_species_id)
      REFERENCES summary_template_species(summary_template_species_id)
  ;

  create trigger audit_summary_template before insert or update or delete on biohub.summary_template for each row execute procedure tr_audit_trigger();
  create trigger audit_summary_template_species before insert or update or delete on biohub.summary_template_species for each row execute procedure tr_audit_trigger();
  create trigger journal_summary_template after insert or update or delete on biohub.summary_template for each row execute procedure tr_journal_trigger();
  create trigger journal_summary_template_species after insert or update or delete on biohub.summary_template_species for each row execute procedure tr_journal_trigger();

  set search_path=biohub_dapi_v1;

  create or replace view template_methodology_species as select * from biohub.template_methodology_species;
  create or replace view survey_summary_submission as select * from biohub.survey_summary_submission;
  create or replace view summary_template as select * from biohub.summary_template;
  create or replace view summary_template_species as select * from biohub.summary_template_species;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
