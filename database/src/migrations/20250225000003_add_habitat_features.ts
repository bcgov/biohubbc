import { Knex } from 'knex';

/**
 * Create new tables:
 * - habitat_feature_type
 *
 * - habitat_feature_quantitative_definition
 *
 * - habitat_feature_qualitative_definition
 * - habitat_feature_qualitative_definition_option
 *
 * - habitat_feature_type_quantitative_option
 * - habitat_feature_type_qualitative_option
 *
 * - survey_habitat_feature
 *
 * - survey_habitat_feature_quantitative_value
 * - survey_habitat_feature_qualitative_value
 *
 * Populates habitat_feature_type with initial records.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create habitat_feature_type lookup table
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub,public;

    CREATE TABLE habitat_feature_type (
      habitat_feature_type_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                       varchar(100)       NOT NULL,
      description                varchar(250),
      record_end_date            date,
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_type_pk PRIMARY KEY (habitat_feature_type_id)
    );

    COMMENT ON TABLE  habitat_feature_type                            IS 'Habitat feature type definitions.';
    COMMENT ON COLUMN habitat_feature_type.habitat_feature_type_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_type.name                       IS 'The name of the habitat feature.';
    COMMENT ON COLUMN habitat_feature_type.description                IS 'The description of the habitat feature.';
    COMMENT ON COLUMN habitat_feature_type.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_type.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_type.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_type.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_type.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_type.revision_count             IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX habitat_feature_nuk1 ON habitat_feature_type(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add index to support the search for a habitat_feature_type by name
    CREATE INDEX habitat_feature_idx1 ON habitat_feature_type(name);

    ----------------------------------------------------------------------------------------
    -- Create habitat_feature_type quantitative/qualitative definition tables
    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_quantitative_definition (
      habitat_feature_quantitative_definition_id    uuid                 DEFAULT public.gen_random_uuid(),
      name                                          varchar(100)         NOT NULL,
      description                                   varchar(250),
      min                                           numeric,
      max                                           numeric,
      unit                                          quantitative_unit,
      record_end_date                               date,
      create_date                                   timestamptz(6)       DEFAULT now() NOT NULL,
      create_user                                   integer              NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer              DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_quantitative_definition_pk PRIMARY KEY (habitat_feature_quantitative_definition_id)
    );

    COMMENT ON TABLE  habitat_feature_quantitative_definition                                               IS 'Quantitative attribute definitions for a habitat feature.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.habitat_feature_quantitative_definition_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.name                                          IS 'The name of the habitat_feature_type attribute.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.description                                   IS 'The description of the habitat_feature_type attribute.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.min                                           IS 'The minimum allowed value (inclusive).';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.max                                           IS 'The maximum allowed value (inclusive).';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.unit                                          IS 'The unit of measure for the value.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.record_end_date                               IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.create_date                                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.create_user                                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.update_date                                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.update_user                                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_quantitative_definition.revision_count                                IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX habitat_feature_quantitative_nuk1 ON habitat_feature_quantitative_definition(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add index to support the search for a habitat_feature_quantitative_definition by name
    CREATE INDEX habitat_feature_quantitative_idx1 ON habitat_feature_quantitative_definition(name);

    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_qualitative_definition (
      habitat_feature_qualitative_definition_id    uuid               DEFAULT public.gen_random_uuid(),
      name                                         varchar(100)       NOT NULL,
      description                                  varchar(400),
      record_end_date                              date,
      create_date                                  timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                  integer            NOT NULL,
      update_date                                  timestamptz(6),
      update_user                                  integer,
      revision_count                               integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_qualitative_definition_pk PRIMARY KEY (habitat_feature_qualitative_definition_id)
    );

    COMMENT ON TABLE  habitat_feature_qualitative_definition                                              IS 'Qualitative attribute definitions for a habitat feature.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.habitat_feature_qualitative_definition_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.name                                         IS 'The name of the habitat_feature_type attribute.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.description                                  IS 'The description of the habitat_feature_type attribute.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.record_end_date                              IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.create_date                                  IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.create_user                                  IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.update_date                                  IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.update_user                                  IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition.revision_count                               IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX habitat_feature_qualitative_nuk1 ON habitat_feature_qualitative_definition(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add index to support the search for a habitat_feature_qualitative_definition by name
    CREATE INDEX habitat_feature_qualitative_idx1 ON habitat_feature_qualitative_definition(name);

    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_qualitative_definition_option (
      habitat_feature_qualitative_definition_option_id     uuid               DEFAULT public.gen_random_uuid(),
      habitat_feature_qualitative_definition_id            uuid               NOT NULL,
      name                                                 varchar(100)       NOT NULL,
      description                                          varchar(400),
      record_end_date                                      date,
      create_date                                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                          integer            NOT NULL,
      update_date                                          timestamptz(6),
      update_user                                          integer,
      revision_count                                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_qualitative_definition_option_pk PRIMARY KEY (habitat_feature_qualitative_definition_option_id)
    );

    COMMENT ON TABLE  habitat_feature_qualitative_definition_option                                                      IS 'Qualitative attribute definition options for a habitat feature.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.habitat_feature_qualitative_definition_option_id     IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.habitat_feature_qualitative_definition_id            IS 'Foreign key to the habitat_feature_qualitative_definition table.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.name                                                 IS 'The name of the option.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.description                                          IS 'The description of the option.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.record_end_date                                      IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.create_date                                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.create_user                                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.update_date                                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.update_user                                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_definition_option.revision_count                                       IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE habitat_feature_qualitative_definition_option
      ADD CONSTRAINT habitat_feature_qualitative_definition_option_fk1
      FOREIGN KEY (habitat_feature_qualitative_definition_id)
      REFERENCES habitat_feature_qualitative_definition(habitat_feature_qualitative_definition_id);

    -- Add indexes for foreign keys
    CREATE INDEX habitat_feature_qualitative_definition_option_idx1 ON habitat_feature_qualitative_definition_option(habitat_feature_qualitative_definition_id);

    -- Add unique end-date key constraint (don't allow 2 records with the same habitat_feature_qualitative_definition_id and name and a NULL record_end_date)
    CREATE UNIQUE INDEX habitat_feature_qualitative_definition_option_nuk1 ON habitat_feature_qualitative_definition_option(habitat_feature_qualitative_definition_id, name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add unique composite key constraint to satisfy foreign key constraint from survey_habitat_feature_qualitative_value
    ALTER TABLE habitat_feature_qualitative_definition_option
        ADD CONSTRAINT habitat_feature_qualitative_definition_option_uk1
        UNIQUE (habitat_feature_qualitative_definition_option_id, habitat_feature_qualitative_definition_id);

    ----------------------------------------------------------------------------------------
    -- Create join tables between habitat_feature_type and habitat_feature_quantitative_definition / habitat_feature_qualitative_definition
    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_type_quantitative_option (
      habitat_feature_type_quantitative_option_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      habitat_feature_quantitative_definition_id     uuid               NOT NULL,
      habitat_feature_type_id                        integer            NOT NULL,
      record_end_date                                date,
      create_date                                    timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                    integer            NOT NULL,
      update_date                                    timestamptz(6),
      update_user                                    integer,
      revision_count                                 integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_type_quantitative_option_pk PRIMARY KEY (habitat_feature_type_quantitative_option_id)
    );

    COMMENT ON TABLE  habitat_feature_type_quantitative_option                                                IS 'Allowed quantitative habitat feature definitions for a habitat feature.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.habitat_feature_type_quantitative_option_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.habitat_feature_quantitative_definition_id     IS 'A foreign key pointing to the habitat_feature_quantitative_definition table.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.habitat_feature_type_id                        IS 'A foreign key pointing to the habitat_feature_type table.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.record_end_date                                IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.create_date                                    IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.create_user                                    IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.update_date                                    IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.update_user                                    IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_type_quantitative_option.revision_count                                 IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE habitat_feature_type_quantitative_option
      ADD CONSTRAINT habitat_feature_type_quantitative_option_fk1
      FOREIGN KEY (habitat_feature_type_id)
      REFERENCES habitat_feature_type(habitat_feature_type_id);

    ALTER TABLE habitat_feature_type_quantitative_option
        ADD CONSTRAINT habitat_feature_type_quantitative_option_fk2
        FOREIGN KEY (habitat_feature_quantitative_definition_id)
        REFERENCES habitat_feature_quantitative_definition(habitat_feature_quantitative_definition_id);

    -- Add indexes for foreign keys
    CREATE INDEX habitat_feature_type_quantitative_option_idx1 ON habitat_feature_type_quantitative_option(habitat_feature_type_id);

    CREATE INDEX habitat_feature_type_quantitative_option_idx2 ON habitat_feature_type_quantitative_option(habitat_feature_quantitative_definition_id);

    -- Add unique composite key constraint to prevent the same habitat_feature_quantitative_definition_id from being assigned to the same habitat_feature_type_id more than once
    ALTER TABLE habitat_feature_type_quantitative_option
        ADD CONSTRAINT habitat_feature_type_quantitative_option_uk1
        UNIQUE (habitat_feature_quantitative_definition_id, habitat_feature_type_id);
  
    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_type_qualitative_option (
      habitat_feature_type_qualitative_option_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      habitat_feature_qualitative_definition_id     uuid               NOT NULL,
      habitat_feature_type_id                       integer            NOT NULL,
      record_end_date                               date,
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_type_qualitative_option_pk PRIMARY KEY (habitat_feature_type_qualitative_option_id)
    );

    COMMENT ON TABLE  habitat_feature_type_qualitative_option                                               IS 'Allowed qualitative habitat feature definitions for a habitat feature.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.habitat_feature_type_qualitative_option_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.habitat_feature_qualitative_definition_id     IS 'A foreign key pointing to the habitat_feature_qualitative_definition table.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.habitat_feature_type_id                       IS 'A foreign key pointing to the habitat_feature_type table.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.record_end_date                               IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.create_date                                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.create_user                                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.update_date                                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.update_user                                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_type_qualitative_option.revision_count                                IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE habitat_feature_type_qualitative_option
      ADD CONSTRAINT habitat_feature_type_qualitative_option_fk1
      FOREIGN KEY (habitat_feature_type_id)
      REFERENCES habitat_feature_type(habitat_feature_type_id);

    ALTER TABLE habitat_feature_type_qualitative_option
        ADD CONSTRAINT habitat_feature_type_qualitative_option_fk2
        FOREIGN KEY (habitat_feature_qualitative_definition_id)
        REFERENCES habitat_feature_qualitative_definition(habitat_feature_qualitative_definition_id);

    -- Add indexes for foreign keys
    CREATE INDEX habitat_feature_type_qualitative_option_idx1 ON habitat_feature_type_qualitative_option(habitat_feature_type_id);

    CREATE INDEX habitat_feature_type_qualitative_option_idx2 ON habitat_feature_type_qualitative_option(habitat_feature_qualitative_definition_id);

    -- Add unique composite key constraint to prevent the same habitat_feature_qualitative_definition_id from being assigned to the same habitat_feature_type_id more than once
    ALTER TABLE habitat_feature_type_qualitative_option
        ADD CONSTRAINT habitat_feature_type_qualitative_option_uk2
        UNIQUE (habitat_feature_qualitative_definition_id, habitat_feature_type_id);

    ----------------------------------------------------------------------------------------
    -- Create survey_habitat_feature table
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature (
      survey_habitat_feature_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                    integer            NOT NULL,
      habitat_feature_type_id      integer            NOT NULL,
      count                        numeric            NOT NULL,
      latitude                     numeric(10, 7)     NOT NULL,
      longitude                    numeric(10, 7)     NOT NULL,
      observed_date                date               NOT NULL,
      observed_time                time               NOT NULL,
      create_date                  timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                  integer            NOT NULL,
      update_date                  timestamptz(6),
      update_user                  integer,
      revision_count               integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_habitat_feature_pk PRIMARY KEY (survey_habitat_feature_id)
    );

    COMMENT ON TABLE  survey_habitat_feature                              IS 'Habitat features observed during a survey.';
    COMMENT ON COLUMN survey_habitat_feature.survey_habitat_feature_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_habitat_feature.survey_id                    IS 'A foreign key pointing to the survey table.';
    COMMENT ON COLUMN survey_habitat_feature.habitat_feature_type_id      IS 'A foreign key pointing to the habitat feature table.';
    COMMENT ON COLUMN survey_habitat_feature.count                        IS 'The count or measured value of the observed habitat features.';
    COMMENT ON COLUMN survey_habitat_feature.latitude                     IS 'The latitude of the observed habitat feature, having ten points of total precision and 7 points of precision after the decimal.';
    COMMENT ON COLUMN survey_habitat_feature.longitude                    IS 'The longitude of the observed habitat feature, having ten points of total precision and 7 points of precision after the decimal.';
    COMMENT ON COLUMN survey_habitat_feature.observed_date                IS 'The date associated with the observation of the habitat feature.';
    COMMENT ON COLUMN survey_habitat_feature.observed_time                IS 'The time associated with the observation of the habitat feature.';
    COMMENT ON COLUMN survey_habitat_feature.create_date                  IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_habitat_feature.create_user                  IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature.update_date                  IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_habitat_feature.update_user                  IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature.revision_count               IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature
      ADD CONSTRAINT survey_habitat_feature_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    ALTER TABLE survey_habitat_feature
        ADD CONSTRAINT survey_habitat_feature_fk2
        FOREIGN KEY (habitat_feature_type_id)
        REFERENCES habitat_feature_type(habitat_feature_type_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_idx1 ON survey_habitat_feature(survey_id);

    CREATE INDEX survey_habitat_feature_idx2 ON survey_habitat_feature(habitat_feature_type_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature_taxon (
      survey_habitat_feature_taxon_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_habitat_feature_id          integer            NOT NULL,
      itis_tsn                           integer            NOT NULL,
      itis_scientific_name               varchar(300)       NOT NULL,
      comment                            varchar(250),
      create_date                        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                        integer            NOT NULL,
      update_date                        timestamptz(6),
      update_user                        integer,
      revision_count                     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_habitat_feature_taxon_pk PRIMARY KEY (survey_habitat_feature_taxon_id)
    );

    COMMENT ON TABLE  survey_habitat_feature_taxon                                    IS 'Taxon related to a habitat feature observed during a survey.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.survey_habitat_feature_taxon_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.survey_habitat_feature_id          IS 'A foreign key pointing to the survey_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.itis_tsn                           IS 'The ITIS TSN identifier for the species associated with the observed habitat feature.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.itis_scientific_name               IS 'The scientific name for the species associated with the observed habitat feature.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.comment                            IS 'A comment or note about the record.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.create_date                        IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.create_user                        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.update_date                        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.update_user                        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.revision_count                     IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature_taxon
      ADD CONSTRAINT survey_habitat_feature_taxon_fk1
      FOREIGN KEY (survey_habitat_feature_id)
      REFERENCES survey_habitat_feature(survey_habitat_feature_id);

    -- Add unique constraint to prevent the same survey habitat feature record from having the same itis_tsn more than once
    ALTER TABLE survey_habitat_feature_taxon ADD CONSTRAINT survey_habitat_feature_taxon_uk1 UNIQUE (survey_habitat_feature_id, itis_tsn);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_taxon_idx1 ON survey_habitat_feature_taxon(survey_habitat_feature_id);

    ----------------------------------------------------------------------------------------
    -- Create join tables between survey_habitat_feature and habitat_feature_quantitative_definition / habitat_feature_qualitative_definition
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature_quantitative_value (
      survey_habitat_feature_quantitative_value_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_habitat_feature_id                       integer            NOT NULL,
      habitat_feature_quantitative_definition_id      uuid               NOT NULL,
      value                                           numeric            NOT NULL,
      create_date                                     timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                     integer            NOT NULL,
      update_date                                     timestamptz(6),
      update_user                                     integer,
      revision_count                                  integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_habitat_feature_quantitative_value_pk PRIMARY KEY (survey_habitat_feature_quantitative_value_id)
    );

    COMMENT ON TABLE  survey_habitat_feature_quantitative_value                                                 IS 'Recorded quantitative value of a habitat feature observed during a survey.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.survey_habitat_feature_quantitative_value_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.survey_habitat_feature_id                       IS 'Foreign key to the survey_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.habitat_feature_quantitative_definition_id      IS 'Foreign key to the habitat_feature_qualitative_definition table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.value                                           IS 'Quantitative data value.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.create_date                                     IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.create_user                                     IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.update_date                                     IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.update_user                                     IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative_value.revision_count                                  IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature_quantitative_value
      ADD CONSTRAINT survey_habitat_feature_quantitative_value_fk1
      FOREIGN KEY (survey_habitat_feature_id)
      REFERENCES survey_habitat_feature(survey_habitat_feature_id);

    ALTER TABLE survey_habitat_feature_quantitative_value
      ADD CONSTRAINT survey_habitat_feature_quantitative_value_fk2
      FOREIGN KEY (habitat_feature_quantitative_definition_id)
      REFERENCES habitat_feature_quantitative_definition(habitat_feature_quantitative_definition_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_quantitative_value_idx1 ON survey_habitat_feature_quantitative_value(survey_habitat_feature_id);

    CREATE INDEX survey_habitat_feature_quantitative_value_idx2 ON survey_habitat_feature_quantitative_value(habitat_feature_quantitative_definition_id);

    -- Add unique constraint
    CREATE UNIQUE INDEX survey_habitat_feature_quantitative_uk1 ON survey_habitat_feature_quantitative_value(survey_habitat_feature_id, habitat_feature_quantitative_definition_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature_qualitative_value (
      survey_habitat_feature_qualitative_value_id         integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_habitat_feature_id                           integer            NOT NULL,
      habitat_feature_qualitative_definition_id           uuid               NOT NULL,
      habitat_feature_qualitative_definition_option_id    uuid               NOT NULL,
      create_date                                         timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                         integer            NOT NULL,
      update_date                                         timestamptz(6),
      update_user                                         integer,
      revision_count                                      integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_habitat_feature_qualitative_value_pk PRIMARY KEY (survey_habitat_feature_qualitative_value_id)
    );

    COMMENT ON TABLE  survey_habitat_feature_qualitative_value                                                     IS 'Recorded qualitative value of a habitat feature observed during a survey.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.survey_habitat_feature_qualitative_value_id         IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.survey_habitat_feature_id                           IS 'Foreign key to the survey_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.habitat_feature_qualitative_definition_id           IS 'Foreign key to the habitat_feature_type_qualitative_option table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.habitat_feature_qualitative_definition_option_id    IS 'Foreign key to the habitat_feature_qualitative_definition_option table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.create_date                                         IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.create_user                                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.update_date                                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.update_user                                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative_value.revision_count                                      IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature_qualitative_value
      ADD CONSTRAINT survey_habitat_feature_qualitative_value_fk1
      FOREIGN KEY (survey_habitat_feature_id)
      REFERENCES survey_habitat_feature(survey_habitat_feature_id);

    ALTER TABLE survey_habitat_feature_qualitative_value
      ADD CONSTRAINT survey_habitat_feature_qualitative_value_fk2
      FOREIGN KEY (habitat_feature_qualitative_definition_id)
      REFERENCES habitat_feature_qualitative_definition(habitat_feature_qualitative_definition_id);

    ALTER TABLE survey_habitat_feature_qualitative_value
      ADD CONSTRAINT survey_habitat_feature_qualitative_value_fk3
      FOREIGN KEY (habitat_feature_qualitative_definition_option_id)
      REFERENCES habitat_feature_qualitative_definition_option(habitat_feature_qualitative_definition_option_id);

    -- Foreign key on both habitat_feature_qualitative_definition_id and habitat_feature_qualitative_definition_option_id
    -- to ensure that the combination of those ids in this table has a valid match in habitat_feature_qualitative_definition_option.
    ALTER TABLE survey_habitat_feature_qualitative_value
      ADD CONSTRAINT survey_habitat_feature_qualitative_value_fk4
      FOREIGN KEY (habitat_feature_qualitative_definition_option_id, habitat_feature_qualitative_definition_id)
      REFERENCES habitat_feature_qualitative_definition_option(habitat_feature_qualitative_definition_option_id, habitat_feature_qualitative_definition_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_qualitative_value_idx1 ON survey_habitat_feature_qualitative_value(survey_habitat_feature_id);

    CREATE INDEX survey_habitat_feature_qualitative_value_idx2 ON survey_habitat_feature_qualitative_value(habitat_feature_qualitative_definition_id);

    CREATE INDEX survey_habitat_feature_qualitative_value_idx3 ON survey_habitat_feature_qualitative_value(habitat_feature_qualitative_definition_option_id);

    CREATE INDEX survey_habitat_feature_qualitative_value_idx4 ON survey_habitat_feature_qualitative_value(habitat_feature_qualitative_definition_option_id, habitat_feature_qualitative_definition_id);

    -- Add unique constraint to ensure only one habitat_feature_qualitative_definition_id can be recorded per survey_habitat_feature_id
    CREATE UNIQUE INDEX survey_habitat_feature_qualitative_uk1 ON survey_habitat_feature_qualitative_value(survey_habitat_feature_id, habitat_feature_qualitative_definition_id);

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_habitat_feature_type BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_type FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_type AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_type FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_quantitative_definition BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_quantitative_definition FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_quantitative_definition AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_quantitative_definition FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_qualitative_definition BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_definition FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_qualitative_definition AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_definition FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_qualitative_definition_option BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_definition_option FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_qualitative_definition_option AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_definition_option FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature_taxon BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_taxon FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature_taxon AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_taxon FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature_quantitative_value BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_quantitative_value FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature_quantitative_value AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_quantitative_value FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature_qualitative_value BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_qualitative_value FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature_qualitative_value AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_qualitative_value FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_qualitative_option BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_type_qualitative_option FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_qualitative_option AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_type_qualitative_option FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_quantitative_option BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_type_quantitative_option FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_quantitative_option AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_type_quantitative_option FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
