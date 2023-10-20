import { Knex } from 'knex';

/**
 * Adds a new table for survey sampling sites, methods, and periods.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create new survey_sample_site table
  ----------------------------------------------------------------------------------------

  SET SEARCH_PATH=biohub,public;

  CREATE TABLE survey_sample_site(
      survey_sample_site_id               integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                           integer                     NOT NULL,
      name                                varchar(50)                 NOT NULL,
      description                         varchar(250),
      geometry                            geometry(geometry, 3005),
      geography                           geography(geometry)         NOT NULL,
      geojson                             jsonb                       NOT NULL,
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT survey_sample_site_pk PRIMARY KEY (survey_sample_site_id)
  );

  COMMENT ON COLUMN survey_sample_site.survey_sample_site_id      IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_site.survey_id                  IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_site.name                       IS 'The name of the sample site.';
  COMMENT ON COLUMN survey_sample_site.description                IS 'The description of the sample site.';
  COMMENT ON COLUMN survey_sample_site.geometry                   IS 'The containing geometry of the record.';
  COMMENT ON COLUMN survey_sample_site.geography                  IS 'The containing geography of the record.';
  COMMENT ON COLUMN survey_sample_site.geojson                    IS 'A GeoJSON representation of the geometry which may contain additional metadata.';
  COMMENT ON COLUMN survey_sample_site.create_date                IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_sample_site.create_user                IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_sample_site.update_date                IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_sample_site.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_sample_site.revision_count             IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_sample_site                             IS 'sample location associated with a given survey.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE survey_sample_site ADD CONSTRAINT survey_sample_site_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX survey_sample_site_idx1 ON survey_sample_site(survey_id);

  -- Add unique constraint (TODO: is this needed?)

  --CREATE UNIQUE INDEX survey_sample_site_uk1 ON survey_sample_site(name, survey_id);

  -- Create audit and journal triggers
  create trigger audit_survey_sample_site before insert or update or delete on survey_sample_site for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_sample_site after insert or update or delete on survey_sample_site for each row execute procedure tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create new methods lookup table
  ----------------------------------------------------------------------------------------

  CREATE TABLE method_lookup(
      method_lookup_id                    integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                                varchar(50)                 NOT NULL,
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT method_lookup_pk PRIMARY KEY (method_lookup_id)
  );

  COMMENT ON COLUMN method_lookup.method_lookup_id     IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN method_lookup.name                 IS 'The name of the method.';
  COMMENT ON COLUMN method_lookup.create_date          IS 'The datetime the record was created.';
  COMMENT ON COLUMN method_lookup.create_user          IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN method_lookup.update_date          IS 'The datetime the record was updated.';
  COMMENT ON COLUMN method_lookup.update_user          IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN method_lookup.revision_count       IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE method_lookup                       IS 'Method lookup table.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add unique constraint (TODO: is this needed?)

  --CREATE UNIQUE INDEX method_lookup_uk1 ON method_lookup(name, survey_id);

  -- Create audit and journal triggers
  create trigger audit_method_lookup before insert or update or delete on method_lookup for each row execute procedure tr_audit_trigger();
  create trigger journal_method_lookup after insert or update or delete on method_lookup for each row execute procedure tr_journal_trigger();


  ----------------------------------------------------------------------------------------
  -- Create new survey_sample_method table
  ----------------------------------------------------------------------------------------

  CREATE TABLE survey_sample_method(
      survey_sample_method_id             integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_sample_site_id               integer                     NOT NULL,
      method_lookup_id                    integer                     NOT NULL,
      description                         varchar(250),
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT survey_sample_method_pk PRIMARY KEY (survey_sample_method_id)
  );

  COMMENT ON COLUMN survey_sample_method.survey_sample_method_id    IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_method.survey_sample_site_id      IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_method.method_lookup_id           IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_method.description                IS 'The description of the sample method.';
  COMMENT ON COLUMN survey_sample_method.create_date                IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_sample_method.create_user                IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_sample_method.update_date                IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_sample_method.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_sample_method.revision_count             IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_sample_method                             IS 'blocks associated with a given survey.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_sample_site_id
  ALTER TABLE survey_sample_method ADD CONSTRAINT survey_sample_method_fk1
    FOREIGN KEY (survey_sample_site_id)
    REFERENCES survey_sample_site(survey_sample_site_id);

  -- Add foreign key constraint from child table to parent table on method_lookup_id
  ALTER TABLE survey_sample_method ADD CONSTRAINT survey_sample_method_fk2
    FOREIGN KEY (method_lookup_id)
    REFERENCES method_lookup(method_lookup_id);

  -- Add foreign key index
  CREATE INDEX survey_sample_method_idx1 ON survey_sample_method(survey_sample_site_id);


  -- Create audit and journal triggers
  create trigger audit_survey_sample_method before insert or update or delete on survey_sample_method for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_sample_method after insert or update or delete on survey_sample_method for each row execute procedure tr_journal_trigger();

   ----------------------------------------------------------------------------------------
  -- Create new survey_sample_method table
  ----------------------------------------------------------------------------------------

  CREATE TABLE survey_sample_period(
      survey_sample_period_id             integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_sample_method_id             integer                     NOT NULL,
      start_date                          date,
      end_date                            date,
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT survey_sample_period_pk PRIMARY KEY (survey_sample_period_id)
  );

  COMMENT ON COLUMN survey_sample_period.survey_sample_period_id     IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_period.survey_sample_method_id     IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_sample_period.start_date                  IS 'Funding start date.';
  COMMENT ON COLUMN survey_sample_period.end_date                    IS 'Funding end date.';
  COMMENT ON COLUMN survey_sample_period.create_date                 IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_sample_period.create_user                 IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_sample_period.update_date                 IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_sample_period.update_user                 IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_sample_period.revision_count              IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_sample_period                              IS 'blocks associated with a given survey.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_sample_method_id
  ALTER TABLE survey_sample_period ADD CONSTRAINT survey_sample_period_fk1
    FOREIGN KEY (survey_sample_method_id)
    REFERENCES survey_sample_method(survey_sample_method_id);

  -- Create audit and journal triggers
  create trigger audit_survey_sample_period before insert or update or delete on survey_sample_period for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_sample_period after insert or update or delete on survey_sample_period for each row execute procedure tr_journal_trigger();


  ----------------------------------------------------------------------------------------
  -- insert data into method_lookup table
  ----------------------------------------------------------------------------------------

  INSERT INTO method_lookup (name, create_user) VALUES ('Camera Trap', 1);
  INSERT INTO method_lookup (name, create_user) VALUES ('Electro Fishing', 1);
  INSERT INTO method_lookup (name, create_user) VALUES ('Dip Net', 1);
  INSERT INTO method_lookup (name, create_user) VALUES ('Box Trap', 1);


  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view survey_sample_site as select * from biohub.survey_sample_site;
  create or replace view method_lookup as select * from biohub.method_lookup;
  create or replace view survey_sample_method as select * from biohub.survey_sample_method;
  create or replace view survey_sample_period as select * from biohub.survey_sample_period;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
