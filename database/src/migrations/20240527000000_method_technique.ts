import { Knex } from 'knex';

/**
 * Create 10 new tables:
 * 
 * ATTRACTANT LOOKUP
 * - attractant_lookup
 *
 * ATTRIBUTE LOOKUPS
 * - technique_attribute_quantitative
 * - technique_attribute_qualitative
 *
 * JOINS BETWEEN ATTRIBUTE LOOKUPS AND METHOD_LOOKUP_ID
 * - method_lookup_attribute_quantitative
 * - method_lookup_attribute_qualitative
 *
 * QUALITATIVE OPTIONS LOOKUP (depends on method_lookup_attribute_qualitative, not technique_attribute_qualitative)
 * - method_lookup_attribute_qualitative_option
 * 
 * METHOD TECHNIQUE TABLE
 * - method_technique
 *
 * JOINS BETWEEN METHOD TECHNIQUE AND METHOD_LOOKUP_ATTRIBUTE_*
 * - method_technique_attribute_quantitative
 * - method_technique_attribute_qualitative
 * 
 * JOIN BETWEEN METHOD TECHNIQUE AND ATTRACTANT_LOOKUP
 * - method_technique_attractant
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Create technique lookup tables
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub, public;

    ----------------------------------------------------------------------------------------

    CREATE TABLE technique_attribute_quantitative (
      technique_attribute_quantitative_id    uuid               DEFAULT public.gen_random_uuid(),
      name                           varchar(100)       NOT NULL,
      description                    varchar(250),
      min                            numeric,
      max                            numeric,
      unit                           environment_unit,
      record_end_date                date,
      create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                    integer            NOT NULL,
      update_date                    timestamptz(6),
      update_user                    integer,
      revision_count                 integer            DEFAULT 0 NOT NULL,
      CONSTRAINT technique_attribute_quantitative_pk PRIMARY KEY (technique_attribute_quantitative_id)
    );

    COMMENT ON TABLE  technique_attribute_quantitative                                IS 'Quantitative technique attributes.';
    COMMENT ON COLUMN technique_attribute_quantitative.technique_attribute_quantitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN technique_attribute_quantitative.name                           IS 'The name of the technique attribute.';
    COMMENT ON COLUMN technique_attribute_quantitative.description                    IS 'The description of the technique attribute.';
    COMMENT ON COLUMN technique_attribute_quantitative.min                            IS 'The minimum allowed value (inclusive).';
    COMMENT ON COLUMN technique_attribute_quantitative.max                            IS 'The maximum allowed value (inclusive).';
    COMMENT ON COLUMN technique_attribute_quantitative.unit                           IS 'The unit of measure for the value.';
    COMMENT ON COLUMN technique_attribute_quantitative.record_end_date                IS 'Record level end date.';
    COMMENT ON COLUMN technique_attribute_quantitative.create_date                    IS 'The datetime the record was created.';
    COMMENT ON COLUMN technique_attribute_quantitative.create_user                    IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_quantitative.update_date                    IS 'The datetime the record was updated.';
    COMMENT ON COLUMN technique_attribute_quantitative.update_user                    IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_quantitative.revision_count                 IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX technique_attribute_quantitative_nuk1 ON technique_attribute_quantitative(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    ----------------------------------------------------------------------------------------

    CREATE TABLE technique_attribute_qualitative (
      technique_attribute_qualitative_id           uuid               DEFAULT public.gen_random_uuid(),
      name                                 varchar(100)       NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT technique_attribute_qualitative_pk PRIMARY KEY (technique_attribute_qualitative_id)
    );

    COMMENT ON TABLE  technique_attribute_qualitative                               IS 'Qualitative technique attributes.';
    COMMENT ON COLUMN technique_attribute_qualitative.technique_attribute_qualitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN technique_attribute_qualitative.name                          IS 'The name of the technique attribute.';
    COMMENT ON COLUMN technique_attribute_qualitative.description                   IS 'The description of the technique attribute.';
    COMMENT ON COLUMN technique_attribute_qualitative.record_end_date               IS 'Record level end date.';
    COMMENT ON COLUMN technique_attribute_qualitative.create_date                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN technique_attribute_qualitative.create_user                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_qualitative.update_date                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN technique_attribute_qualitative.update_user                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_qualitative.revision_count                IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX technique_attribute_qualitative_nuk1 ON technique_attribute_qualitative(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    ----------------------------------------------------------------------------------------
    -- Create technique join tables
    ----------------------------------------------------------------------------------------

    CREATE TABLE method_lookup_attribute_qualitative (
      method_lookup_attribute_qualitative_id    uuid          DEFAULT public.gen_random_uuid(),
      technique_attribute_qualitative_id   uuid               NOT NULL,
      method_lookup_id                     integer            NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_lookup_attribute_qualitative_pk PRIMARY KEY (method_lookup_attribute_qualitative_id)
    );

    COMMENT ON TABLE  method_lookup_attribute_qualitative                                      IS 'Qualitative attributes available for a method lookup id.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.method_lookup_attribute_qualitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.technique_attribute_qualitative_id           IS 'Foreign key to the technique_attribute_qualitative table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.method_lookup_id                     IS 'Foreign key to the method_lookup table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.description                          IS 'The description of the attribute.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.record_end_date                      IS 'Record level end date.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative.revision_count                       IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same technique_attribute_qualitative_id and method_lookup_id and a NULL record_end_date)
    CREATE UNIQUE INDEX method_lookup_attribute_qualitative_nuk1 ON method_lookup_attribute_qualitative(technique_attribute_qualitative_id, method_lookup_id, (record_end_date IS NULL)) WHERE record_end_date IS NULL;
    
    -- Add unique composite key constraint
    ALTER TABLE method_lookup_attribute_qualitative
      ADD CONSTRAINT method_lookup_attribute_qualitative_uk1
      UNIQUE (method_lookup_attribute_qualitative_id, technique_attribute_qualitative_id);

    -- Add foreign key constraint
    ALTER TABLE method_lookup_attribute_qualitative
      ADD CONSTRAINT method_lookup_attribute_qualitative_fk1
      FOREIGN KEY (technique_attribute_qualitative_id)
      REFERENCES technique_attribute_qualitative(technique_attribute_qualitative_id);

    ALTER TABLE method_lookup_attribute_qualitative
      ADD CONSTRAINT method_lookup_attribute_qualitative_fk2
      FOREIGN KEY (method_lookup_id)
      REFERENCES method_lookup(method_lookup_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_lookup_attribute_qualitative_idx1 ON method_lookup_attribute_qualitative(technique_attribute_qualitative_id);

    CREATE INDEX method_lookup_attribute_qualitative_idx2 ON method_lookup_attribute_qualitative(method_lookup_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE method_lookup_attribute_quantitative (
      method_lookup_attribute_quantitative_id    uuid               DEFAULT public.gen_random_uuid(),
      technique_attribute_quantitative_id  uuid               NOT NULL,
      method_lookup_id                     integer               NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_lookup_attribute_quantitative_pk PRIMARY KEY (method_lookup_attribute_quantitative_id)
    );

    COMMENT ON TABLE  method_lookup_attribute_quantitative                                      IS 'quantitative attributes available for a method lookup id.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.method_lookup_attribute_quantitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.technique_attribute_quantitative_id           IS 'Foreign key to the technique_attribute_quantitative table.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.method_lookup_id                     IS 'Foreign key to the method_lookup table.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.description                          IS 'The description of the attribute.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.record_end_date                      IS 'Record level end date.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_quantitative.revision_count                       IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same technique_attribute_quantitative_id and method_lookup_id and a NULL record_end_date)
    CREATE UNIQUE INDEX method_lookup_attribute_quantitative_nuk1 ON method_lookup_attribute_quantitative(technique_attribute_quantitative_id, method_lookup_id, (record_end_date IS NULL)) WHERE record_end_date IS NULL;
    
    -- Add unique composite key constraint
    ALTER TABLE method_lookup_attribute_quantitative
      ADD CONSTRAINT method_lookup_attribute_quantitative_uk1
      UNIQUE (method_lookup_attribute_quantitative_id, technique_attribute_quantitative_id);

    -- Add foreign key constraint
    ALTER TABLE method_lookup_attribute_quantitative
      ADD CONSTRAINT method_lookup_attribute_quantitative_fk1
      FOREIGN KEY (technique_attribute_quantitative_id)
      REFERENCES technique_attribute_quantitative(technique_attribute_quantitative_id);
      

    ALTER TABLE method_lookup_attribute_quantitative
      ADD CONSTRAINT method_lookup_attribute_quantitative_fk2
      FOREIGN KEY (method_lookup_id)
      REFERENCES method_lookup(method_lookup_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_lookup_attribute_quantitative_idx1 ON method_lookup_attribute_quantitative(technique_attribute_quantitative_id);

    CREATE INDEX method_lookup_attribute_quantitative_idx2 ON method_lookup_attribute_quantitative(method_lookup_id);

    ----------------------------------------------------------------------------------------
    -- Create technique attractant lookup table
    ----------------------------------------------------------------------------------------

    CREATE TABLE attractant_lookup (
      attractant_lookup_id                 integer            NOT NULL GENERATED ALWAYS AS IDENTITY,
      name                                 varchar(100)       NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT attractant_lookup_pk PRIMARY KEY (attractant_lookup_id)
    );

    COMMENT ON TABLE  attractant_lookup                               IS 'Attractant lookup options.';
    COMMENT ON COLUMN attractant_lookup.attractant_lookup_id          IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN attractant_lookup.name                          IS 'The name of the attractant.';
    COMMENT ON COLUMN attractant_lookup.description                   IS 'The description of the attractant.';
    COMMENT ON COLUMN attractant_lookup.record_end_date               IS 'Record level end date.';
    COMMENT ON COLUMN attractant_lookup.create_date                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN attractant_lookup.create_user                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN attractant_lookup.update_date                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN attractant_lookup.update_user                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN attractant_lookup.revision_count                IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX attractant_lookup_nuk1 ON attractant_lookup(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    ----------------------------------------------------------------------------------------
    -- Create qualitative options table
    ----------------------------------------------------------------------------------------

    CREATE TABLE method_lookup_attribute_qualitative_option (
      method_lookup_attribute_qualitative_option_id    uuid               DEFAULT public.gen_random_uuid(),
      method_lookup_attribute_qualitative_id           uuid               NOT NULL,
      name                                 varchar(100)       NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_lookup_attribute_qualitative_option_pk PRIMARY KEY (method_lookup_attribute_qualitative_option_id)
    );

    COMMENT ON TABLE  method_lookup_attribute_qualitative_option                                      IS 'qualitative technique attribute options.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.method_lookup_attribute_qualitative_option_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.method_lookup_attribute_qualitative_id           IS 'Foreign key to the method_lookup_attribute_qualitative table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.name                                 IS 'The name of the option.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.description                          IS 'The description of the option.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.record_end_date                      IS 'Record level end date.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.revision_count                       IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same method_lookup_attribute_qualitative_id and name and a NULL record_end_date)
    CREATE UNIQUE INDEX method_lookup_attribute_qualitative_option_nuk1 ON method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_id, name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;
    
    -- Add unique composite key constraint
    ALTER TABLE method_lookup_attribute_qualitative_option
      ADD CONSTRAINT method_lookup_attribute_qualitative_option_uk1
      UNIQUE (method_lookup_attribute_qualitative_option_id, method_lookup_attribute_qualitative_id);

    -- Add foreign key constraint
    ALTER TABLE method_lookup_attribute_qualitative_option
      ADD CONSTRAINT method_lookup_attribute_qualitative_option_fk1
      FOREIGN KEY (method_lookup_attribute_qualitative_id)
      REFERENCES method_lookup_attribute_qualitative(method_lookup_attribute_qualitative_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_lookup_attribute_qualitative_option_idx1 ON method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_id);

    ----------------------------------------------------------------------------------------
    -- Create method technique tables
    ----------------------------------------------------------------------------------------

    CREATE TABLE method_technique (
      method_technique_id                                 integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                                           integer            NOT NULL,
      name                                                varchar(64)        NOT NULL,
      description                                         varchar(1048),
      distance_threshold                                  decimal,
      method_lookup_id                                    integer            NOT NULL,
      create_date                                         timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                         integer            NOT NULL,
      update_date                                         timestamptz(6),
      update_user                                         integer,
      revision_count                                      integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_technique_pk PRIMARY KEY (method_technique_id)
    );

    COMMENT ON TABLE  method_technique                                                     IS 'This table is intended to track method techniques created within a survey.';
    COMMENT ON COLUMN method_technique.method_technique_id                                 IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_technique.survey_id                                           IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN method_technique.name                                                IS 'Name of the method technique.';
    COMMENT ON COLUMN method_technique.description                                         IS 'Description of the method technique.';
    COMMENT ON COLUMN method_technique.distance_threshold                                  IS 'Maximum distance under which data were collected. Data beyond the distance threshold are not included.';
    COMMENT ON COLUMN method_technique.method_lookup_id                                    IS 'Foreign key to the method_lookup table.';
    COMMENT ON COLUMN method_technique.create_date                                         IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_technique.create_user                                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique.update_date                                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_technique.update_user                                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique.revision_count                                      IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX method_technique_uk1 ON method_technique(method_technique_id);

    -- Add foreign key constraint
    ALTER TABLE method_technique
      ADD CONSTRAINT method_technique_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    ALTER TABLE method_technique
      ADD CONSTRAINT method_technique_fk2
      FOREIGN KEY (method_lookup_id)
      REFERENCES method_lookup(method_lookup_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_idx1 ON method_technique(survey_id);

    CREATE INDEX method_technique_idx2 ON method_technique(method_lookup_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE method_technique_attribute_quantitative (
      method_technique_attribute_quantitative_id          integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      method_technique_id                                 integer            NOT NULL,
      method_lookup_attribute_quantitative_id             uuid               NOT NULL,
      value                                               numeric            NOT NULL,
      create_date                                         timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                         integer            NOT NULL,
      update_date                                         timestamptz(6),
      update_user                                         integer,
      revision_count                                      integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_technique_attribute_quantitative_pk PRIMARY KEY (method_technique_attribute_quantitative_id)
    );

    COMMENT ON TABLE  method_technique_attribute_quantitative                                                     IS 'This table is intended to track quantitative technique attributes applied to a particular technique.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.method_technique_attribute_quantitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.method_technique_id                             IS 'Foreign key to the method_technique table.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.method_lookup_attribute_quantitative_id                         IS 'Foreign key to the technique_attribute_quantitative table.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.value                                               IS 'Quantitative data value.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.create_date                                         IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.create_user                                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.update_date                                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.update_user                                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_attribute_quantitative.revision_count                                      IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX method_technique_attribute_quantitative_uk1 ON method_technique_attribute_quantitative(method_technique_id, method_lookup_attribute_quantitative_id);

    -- Add foreign key constraint
    ALTER TABLE method_technique_attribute_quantitative
      ADD CONSTRAINT method_technique_attribute_quantitative_fk1
      FOREIGN KEY (method_technique_id)
      REFERENCES method_technique(method_technique_id);

    ALTER TABLE method_technique_attribute_quantitative
      ADD CONSTRAINT method_technique_attribute_quantitative_fk2
      FOREIGN KEY (method_lookup_attribute_quantitative_id)
      REFERENCES technique_attribute_quantitative(technique_attribute_quantitative_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_attribute_quantitative_idx1 ON method_technique_attribute_quantitative(method_technique_id);

    CREATE INDEX method_technique_attribute_quantitative_idx2 ON method_technique_attribute_quantitative(method_lookup_attribute_quantitative_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE method_technique_attractant (
      method_technique_attractant_id                      integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      method_technique_id                                 integer            NOT NULL,
      attractant_lookup_id                                integer            NOT NULL,
      create_date                                         timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                         integer            NOT NULL,
      update_date                                         timestamptz(6),
      update_user                                         integer,
      revision_count                                      integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_technique_attractant_pk PRIMARY KEY (method_technique_attractant_id)
    );

    COMMENT ON TABLE  method_technique_attractant                                                     IS 'This table is intended to track attractants applied to a particular technique.';
    COMMENT ON COLUMN method_technique_attractant.method_technique_attractant_id                      IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_technique_attractant.method_technique_id                                 IS 'Foreign key to the method_technique table.';
    COMMENT ON COLUMN method_technique_attractant.attractant_lookup_id                                IS 'Foreign key to the attractant_lookup table.';
    COMMENT ON COLUMN method_technique_attractant.create_date                                         IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_technique_attractant.create_user                                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_attractant.update_date                                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_technique_attractant.update_user                                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_attractant.revision_count                                      IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX method_technique_attractant_uk1 ON method_technique_attractant(method_technique_id, attractant_lookup_id);

    -- Add foreign key constraint
    ALTER TABLE method_technique_attractant
      ADD CONSTRAINT method_technique_attractant_fk1
      FOREIGN KEY (method_technique_id)
      REFERENCES method_technique(method_technique_id);

    ALTER TABLE method_technique_attractant
      ADD CONSTRAINT method_technique_attractant_fk2
      FOREIGN KEY (attractant_lookup_id)
      REFERENCES attractant_lookup(attractant_lookup_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_attractant_idx1 ON method_technique_attractant(method_technique_id);

    CREATE INDEX method_technique_attractant_idx2 ON method_technique_attractant(attractant_lookup_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE method_technique_attribute_qualitative (
      method_technique_attribute_qualitative_id          integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      method_technique_id                                integer            NOT NULL,
      method_lookup_attribute_qualitative_id             uuid               NOT NULL,
      method_lookup_attribute_qualitative_option_id      uuid               NOT NULL,
      create_date                                        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                        integer            NOT NULL,
      update_date                                        timestamptz(6),
      update_user                                        integer,
      revision_count                                     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_technique_attribute_qualitative_pk PRIMARY KEY (method_technique_attribute_qualitative_id)
    );

    COMMENT ON TABLE  method_technique_attribute_qualitative                                                    IS 'This table is intended to track qualitative technique attributes applied to a particular method_technique.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.method_technique_attribute_qualitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.method_technique_id                            IS 'Foreign key to the method_technique table.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.method_lookup_attribute_qualitative_id                         IS 'Foreign key to the method_lookup_attribute_qualitative table.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.method_lookup_attribute_qualitative_option_id                  IS 'Foreign key to the method_lookup_attribute_qualitative_option table.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.create_date                                        IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.create_user                                        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.update_date                                        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.update_user                                        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_attribute_qualitative.revision_count                                     IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX method_technique_attribute_qualitative_uk1 ON method_technique_attribute_qualitative(method_technique_id, method_lookup_attribute_qualitative_id, method_lookup_attribute_qualitative_option_id);

    -- Add foreign key constraint
    ALTER TABLE method_technique_attribute_qualitative
      ADD CONSTRAINT method_technique_attribute_qualitative_fk1
      FOREIGN KEY (method_technique_id)
      REFERENCES method_technique(method_technique_id);

    ALTER TABLE method_technique_attribute_qualitative
      ADD CONSTRAINT method_technique_attribute_qualitative_fk2
      FOREIGN KEY (method_lookup_attribute_qualitative_id)
      REFERENCES method_lookup_attribute_qualitative(method_lookup_attribute_qualitative_id);

    ALTER TABLE method_technique_attribute_qualitative
      ADD CONSTRAINT method_technique_attribute_qualitative_fk3
      FOREIGN KEY (method_lookup_attribute_qualitative_option_id)
      REFERENCES method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_option_id);

    -- Foreign key on both method_lookup_attribute_qualitative_id and method_lookup_attribute_qualitative_option_id of 
    -- method_lookup_attribute_qualitative_option to ensure that the combination of those ids in this table has a valid match.
    ALTER TABLE method_technique_attribute_qualitative
      ADD CONSTRAINT method_technique_attribute_qualitative_fk4
      FOREIGN KEY (method_lookup_attribute_qualitative_id, method_lookup_attribute_qualitative_option_id)
      REFERENCES method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_id, method_lookup_attribute_qualitative_option_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_attribute_qualitative_idx1 ON method_technique_attribute_qualitative(method_technique_id);

    CREATE INDEX method_technique_attribute_qualitative_idx2 ON method_technique_attribute_qualitative(method_lookup_attribute_qualitative_id);

    CREATE INDEX method_technique_attribute_qualitative_idx3 ON method_technique_attribute_qualitative(method_lookup_attribute_qualitative_option_id);

    ----------------------------------------------------------------------------------------
    -- Alter method table to include technique ID
    ----------------------------------------------------------------------------------------
    ALTER TABLE survey_sample_method ADD COLUMN method_technique_id INTEGER;

    COMMENT ON COLUMN survey_sample_method.method_technique_id IS 'The technique of the method.';

    ALTER TABLE survey_sample_method ADD CONSTRAINT "survey_sample_method_fk3"
      FOREIGN KEY (method_technique_id)
      REFERENCES method_technique(method_technique_id);

    CREATE INDEX survey_sample_method_idx2 ON survey_sample_method(method_technique_id);

    -- add missing index
    CREATE INDEX survey_sample_method_idx3 ON survey_sample_method(method_lookup_id);

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_technique_attribute_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.technique_attribute_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_technique_attribute_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.technique_attribute_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_technique_attribute_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.technique_attribute_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_technique_attribute_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.technique_attribute_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_lookup_attribute_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_lookup_attribute_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_lookup_attribute_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.method_lookup_attribute_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_lookup_attribute_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_lookup_attribute_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_lookup_attribute_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.method_lookup_attribute_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_lookup_attribute_qualitative_option BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_lookup_attribute_qualitative_option FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_lookup_attribute_qualitative_option AFTER INSERT OR UPDATE OR DELETE ON biohub.method_lookup_attribute_qualitative_option FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_technique_attribute_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_technique_attribute_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique_attribute_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.method_technique_attribute_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_technique_attribute_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_technique_attribute_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique_attribute_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.method_technique_attribute_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_technique BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_technique FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique AFTER INSERT OR UPDATE OR DELETE ON biohub.method_technique FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_attractant_lookup BEFORE INSERT OR UPDATE OR DELETE ON biohub.attractant_lookup FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_attractant_lookup AFTER INSERT OR UPDATE OR DELETE ON biohub.attractant_lookup FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_method_technique_attractant BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_technique_attractant FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique_attractant AFTER INSERT OR UPDATE OR DELETE ON biohub.method_technique_attractant FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW technique_attribute_quantitative AS SELECT * FROM biohub.technique_attribute_quantitative;

    CREATE OR REPLACE VIEW technique_attribute_qualitative AS SELECT * FROM biohub.technique_attribute_qualitative;

    CREATE OR REPLACE VIEW method_lookup_attribute_quantitative AS SELECT * FROM biohub.method_lookup_attribute_quantitative;

    CREATE OR REPLACE VIEW method_lookup_attribute_qualitative AS SELECT * FROM biohub.method_lookup_attribute_qualitative;
    
    CREATE OR REPLACE VIEW method_lookup_attribute_qualitative_option AS SELECT * FROM biohub.method_lookup_attribute_qualitative_option;

    CREATE OR REPLACE VIEW technique_attribute_quantitative AS SELECT * FROM biohub.technique_attribute_quantitative;

    CREATE OR REPLACE VIEW technique_attribute_qualitative AS SELECT * FROM biohub.technique_attribute_qualitative;

    CREATE OR REPLACE VIEW method_technique AS SELECT * FROM biohub.method_technique;

    CREATE OR REPLACE VIEW attractant_lookup AS SELECT * FROM biohub.attractant_lookup;

    CREATE OR REPLACE VIEW method_technique_attractant AS SELECT * FROM biohub.method_technique_attractant;

    CREATE OR REPLACE VIEW survey_sample_method AS SELECT * FROM biohub.survey_sample_method;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
