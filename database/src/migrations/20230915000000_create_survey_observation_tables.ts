import { Knex } from 'knex';

/**
 * Adds a new table for sampling locations, which are associated to surveys;
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create new sample_location table
  ----------------------------------------------------------------------------------------

  SET SEARCH_PATH=biohub,public;

  CREATE TABLE sample_location(
      sample_location_id                  integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                           integer                     NOT NULL,
      geometry                            geometry(geometry, 3005),
      geography                           geography(geometry)         NOT NULL,
      geojson                             jsonb                       NOT NULL,
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT sample_location_pk PRIMARY KEY (sample_location_id)
  );

  COMMENT ON COLUMN sample_location.sample_location_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_location.survey_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_location.geometry IS 'The containing geometry of the record.';
  COMMENT ON COLUMN sample_location.geography IS 'The containing geography of the record.';
  COMMENT ON COLUMN sample_location.geojson IS 'A GeoJSON representation of the geometry which may contain additional metadata.';
  COMMENT ON COLUMN sample_location.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN sample_location.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN sample_location.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN sample_location.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN sample_location.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE sample_location IS 'sample location associated with a given survey.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE sample_location ADD CONSTRAINT sample_location_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX sample_location_idx1 ON sample_location(survey_id);

  -- Add unique constraint (TODO: is this needed?)

  --CREATE UNIQUE INDEX sample_location_uk1 ON sample_location(name, survey_id);

  -- Create audit and journal triggers
  create trigger audit_sample_location before insert or update or delete on sample_location for each row execute procedure tr_audit_trigger();
  create trigger journal_sample_location after insert or update or delete on sample_location for each row execute procedure tr_journal_trigger();

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

  COMMENT ON COLUMN method_lookup.method_lookup_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN method_lookup.name IS 'The name of the method.';
  COMMENT ON COLUMN method_lookup.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN method_lookup.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN method_lookup.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN method_lookup.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN method_lookup.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE method_lookup IS 'Method lookup table.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add unique constraint (TODO: is this needed?)

  --CREATE UNIQUE INDEX method_lookup_uk1 ON method_lookup(name, survey_id);

  -- Create audit and journal triggers
  create trigger audit_method_lookup before insert or update or delete on method_lookup for each row execute procedure tr_audit_trigger();
  create trigger journal_method_lookup after insert or update or delete on method_lookup for each row execute procedure tr_journal_trigger();


  ----------------------------------------------------------------------------------------
  -- Create new sample_method table
  ----------------------------------------------------------------------------------------

  CREATE TABLE sample_method(
      sample_method_id                    integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      sample_location_id                  integer                     NOT NULL,
      method_lookup_id                    integer                     NOT NULL,
      description                         varchar(250),
      start_date                          date,
      end_date                            date,
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT sample_method_pk PRIMARY KEY (sample_method_id)
  );

  COMMENT ON COLUMN sample_method.sample_method_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_method.sample_location_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_method.method_lookup_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_method.description IS 'The description of the sample method.';
  COMMENT ON COLUMN sample_method.start_date IS 'Funding start date.';
  COMMENT ON COLUMN sample_method.end_date IS 'Funding end date.';
  COMMENT ON COLUMN sample_method.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN sample_method.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN sample_method.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN sample_method.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN sample_method.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE sample_method IS 'blocks associated with a given survey.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------



  -- Add foreign key constraint from child table to parent table on sample_location_id
  ALTER TABLE sample_method ADD CONSTRAINT sample_method_fk2
    FOREIGN KEY (sample_location_id)
    REFERENCES sample_location(sample_location_id);

  -- Add foreign key constraint from child table to parent table on method_lookup_id
  ALTER TABLE sample_method ADD CONSTRAINT sample_method_fk3
    FOREIGN KEY (method_lookup_id)
    REFERENCES method_lookup(method_lookup_id);

  -- Add foreign key index
  CREATE INDEX sample_method_idx1 ON sample_method(survey_id);

  -- Add unique constraint (TODO: is this needed?)

  --CREATE UNIQUE INDEX sample_method_uk1 ON sample_method(name, survey_id);

  -- Create audit and journal triggers
  create trigger audit_sample_method before insert or update or delete on sample_method for each row execute procedure tr_audit_trigger();
  create trigger journal_sample_method after insert or update or delete on sample_method for each row execute procedure tr_journal_trigger();

   ----------------------------------------------------------------------------------------
  -- Create new sample_method table
  ----------------------------------------------------------------------------------------

  CREATE TABLE sample_period(
      sample_period_id                    integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      sample_method_id                    integer                     NOT NULL,
      start_date                          date,
      end_date                            date,
      create_date                         timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                         integer                     NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT sample_period_pk PRIMARY KEY (sample_period_id)
  );

  COMMENT ON COLUMN sample_period.sample_period_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_period.sample_method_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN sample_period.start_date IS 'Funding start date.';
  COMMENT ON COLUMN sample_period.end_date IS 'Funding end date.';
  COMMENT ON COLUMN sample_period.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN sample_period.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN sample_period.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN sample_period.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN sample_period.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE sample_period IS 'blocks associated with a given survey.';


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on sample_method_id
  ALTER TABLE sample_period ADD CONSTRAINT sample_period_fk1
    FOREIGN KEY (sample_method_id)
    REFERENCES sample_method(sample_method_id);

  -- Create audit and journal triggers
  create trigger audit_sample_period before insert or update or delete on sample_period for each row execute procedure tr_audit_trigger();
  create trigger journal_sample_period after insert or update or delete on sample_period for each row execute procedure tr_journal_trigger();


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

  create or replace view sample_location as select * from biohub.sample_location;
  create or replace view method_lookup as select * from biohub.method_lookup;
  create or replace view sample_method as select * from biohub.sample_method;
  create or replace view sample_period as select * from biohub.sample_period;
n
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
