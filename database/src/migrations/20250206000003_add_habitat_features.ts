import { Knex } from 'knex';

/**
 * Create new tables:
 * - habitat_feature_quantitative
 * - habitat_feature_qualitative
 * - habitat_feature_qualitative_habitat_feature_option
 * - survey_habitat_feature
 * - survey_habitat_feature_quantitative
 * - survey_habitat_feature_qualitative
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create habitat_feature lookup tables
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub,public;

    CREATE TABLE habitat_feature (
      habitat_feature_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                  varchar(100)       NOT NULL,
      description           varchar(250),
      record_end_date       date,
      create_date           timestamptz(6)     DEFAULT now() NOT NULL,
      create_user           integer            NOT NULL,
      update_date           timestamptz(6),
      update_user           integer,
      revision_count        integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_pk PRIMARY KEY (habitat_feature_id)
    );
  
    COMMENT ON TABLE  habitat_feature                       IS 'Habitat feature type definitions.';
    COMMENT ON COLUMN habitat_feature.habitat_feature_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature.name                  IS 'The name of the habitat feature.';
    COMMENT ON COLUMN habitat_feature.description           IS 'The description of the habitat feature.';
    COMMENT ON COLUMN habitat_feature.record_end_date       IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature.create_date           IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature.create_user           IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature.update_date           IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature.update_user           IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature.revision_count        IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX habitat_feature_nuk1 ON habitat_feature(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;
  
    -- Add index to support the search for a habitat_feature by name
    CREATE INDEX habitat_feature_idx1 ON habitat_feature(name);

    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_quantitative (
      habitat_feature_quantitative_id    uuid                 DEFAULT public.gen_random_uuid(),
      name                               varchar(100)         NOT NULL,
      description                        varchar(250),
      min                                numeric,
      max                                numeric,
      unit                               quantitative_unit,
      record_end_date                    date,
      create_date                        timestamptz(6)       DEFAULT now() NOT NULL,
      create_user                        integer              NOT NULL,
      update_date                        timestamptz(6),
      update_user                        integer,
      revision_count                     integer              DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_quantitative_pk PRIMARY KEY (habitat_feature_quantitative_id)
    );

    COMMENT ON TABLE  habitat_feature_quantitative                                    IS 'Quantitative habitat_feature attributes.';
    COMMENT ON COLUMN habitat_feature_quantitative.habitat_feature_quantitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_quantitative.name                               IS 'The name of the habitat_feature attribute.';
    COMMENT ON COLUMN habitat_feature_quantitative.description                        IS 'The description of the habitat_feature attribute.';
    COMMENT ON COLUMN habitat_feature_quantitative.min                                IS 'The minimum allowed value (inclusive).';
    COMMENT ON COLUMN habitat_feature_quantitative.max                                IS 'The maximum allowed value (inclusive).';
    COMMENT ON COLUMN habitat_feature_quantitative.unit                               IS 'The unit of measure for the value.';
    COMMENT ON COLUMN habitat_feature_quantitative.record_end_date                    IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_quantitative.create_date                        IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_quantitative.create_user                        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_quantitative.update_date                        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_quantitative.update_user                        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_quantitative.revision_count                     IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX habitat_feature_quantitative_nuk1 ON habitat_feature_quantitative(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add index to support the search for a habitat_feature_quantitative by name
    CREATE INDEX habitat_feature_quantitative_idx1 ON habitat_feature_quantitative(name);

    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_qualitative (
      habitat_feature_qualitative_id    uuid               DEFAULT public.gen_random_uuid(),
      name                              varchar(100)       NOT NULL,
      description                       varchar(400),
      record_end_date                   date,
      create_date                       timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                       integer            NOT NULL,
      update_date                       timestamptz(6),
      update_user                       integer,
      revision_count                    integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_qualitative_pk PRIMARY KEY (habitat_feature_qualitative_id)
    );

    COMMENT ON TABLE  habitat_feature_qualitative                                   IS 'Qualitative habitat_feature attributes.';
    COMMENT ON COLUMN habitat_feature_qualitative.habitat_feature_qualitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_qualitative.name                              IS 'The name of the habitat_feature attribute.';
    COMMENT ON COLUMN habitat_feature_qualitative.description                       IS 'The description of the habitat_feature attribute.';
    COMMENT ON COLUMN habitat_feature_qualitative.record_end_date                   IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_qualitative.create_date                       IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_qualitative.create_user                       IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative.update_date                       IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_qualitative.update_user                       IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative.revision_count                    IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX habitat_feature_qualitative_nuk1 ON habitat_feature_qualitative(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add index to support the search for a habitat_feature_qualitative by name
    CREATE INDEX habitat_feature_qualitative_idx1 ON habitat_feature_qualitative(name);

    ----------------------------------------------------------------------------------------
    -- Assign allowed habitat feature measurements to habitat features
    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_qualitative_habitat_feature (
      habitat_feature_qualitative_habitat_feature_id    uuid               DEFAULT public.gen_random_uuid(),
      habitat_feature_qualitative_id                    uuid               NOT NULL,
      habitat_feature_id                                integer            NOT NULL,
      record_end_date                                   date,
      observed_time                                     time               NOT NULL,
      create_date                                       timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                       integer            NOT NULL,
      update_date                                       timestamptz(6),
      update_user                                       integer,
      revision_count                                    integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_qualitative_habitat_feature_pk PRIMARY KEY (habitat_feature_qualitative_habitat_feature_id)
    );

    COMMENT ON TABLE  habitat_feature_qualitative_habitat_feature                              IS 'Habitat features observed during a survey.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.habitat_feature_qualitative_habitat_feature_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.habitat_feature_qualitative_id   IS 'A foreign key pointing to the habitat_feature_qualitative table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.habitat_feature_id           IS 'A foreign key pointing to the habitat feature table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.record_end_date              IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.create_date                  IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.create_user                  IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.update_date                  IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.update_user                  IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature.revision_count               IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE habitat_feature_qualitative_habitat_feature
      ADD CONSTRAINT habitat_feature_qualitative_habitat_feature_fk1
      FOREIGN KEY (habitat_feature_id)
      REFERENCES habitat_feature(habitat_feature_id);

    ALTER TABLE habitat_feature_qualitative_habitat_feature
        ADD CONSTRAINT habitat_feature_qualitative_habitat_feature_fk2
        FOREIGN KEY (habitat_feature_qualitative_id)
        REFERENCES habitat_feature_qualitative(habitat_feature_qualitative_id);

    -- Add indexes for foreign keys
    CREATE INDEX habitat_feature_qualitative_habitat_feature_idx1 ON habitat_feature_qualitative_habitat_feature(habitat_feature_id);

    CREATE INDEX habitat_feature_qualitative_habitat_feature_idx2 ON habitat_feature_qualitative_habitat_feature(habitat_feature_qualitative_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_quantitative_habitat_feature (
      habitat_feature_quantitative_habitat_feature_id   uuid               DEFAULT public.gen_random_uuid(),
      habitat_feature_quantitative_id                   uuid               NOT NULL,
      habitat_feature_id                                integer            NOT NULL,
      record_end_date                                   date,
      observed_time                                     time               NOT NULL,
      create_date                                       timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                       integer            NOT NULL,
      update_date                                       timestamptz(6),
      update_user                                       integer,
      revision_count                                    integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_quantitative_habitat_feature_pk PRIMARY KEY (habitat_feature_quantitative_habitat_feature_id)
    );

    COMMENT ON TABLE  habitat_feature_quantitative_habitat_feature                              IS 'Habitat features observed during a survey.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.habitat_feature_quantitative_habitat_feature_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.habitat_feature_quantitative_id   IS 'A foreign key pointing to the habitat_feature_quantitative table.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.habitat_feature_id           IS 'A foreign key pointing to the habitat feature table.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.record_end_date              IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.create_date                  IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.create_user                  IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.update_date                  IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.update_user                  IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_quantitative_habitat_feature.revision_count               IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE habitat_feature_quantitative_habitat_feature
      ADD CONSTRAINT habitat_feature_quantitative_habitat_feature_fk1
      FOREIGN KEY (habitat_feature_id)
      REFERENCES habitat_feature(habitat_feature_id);

    ALTER TABLE habitat_feature_quantitative_habitat_feature
        ADD CONSTRAINT habitat_feature_quantitative_habitat_feature_fk2
        FOREIGN KEY (habitat_feature_quantitative_id)
        REFERENCES habitat_feature_quantitative(habitat_feature_quantitative_id);

    -- Add indexes for foreign keys
    CREATE INDEX habitat_feature_quantitative_habitat_feature_idx1 ON habitat_feature_quantitative_habitat_feature(habitat_feature_id);

    CREATE INDEX habitat_feature_quantitative_habitat_feature_idx2 ON habitat_feature_quantitative_habitat_feature(habitat_feature_quantitative_id);
    
    ----------------------------------------------------------------------------------------

    CREATE TABLE habitat_feature_qualitative_habitat_feature_option (
      habitat_feature_qualitative_habitat_feature_option_id    uuid               DEFAULT public.gen_random_uuid(),
      habitat_feature_qualitative_habitat_feature_id           uuid               NOT NULL,
      name                                                     varchar(100)       NOT NULL,
      description                                              varchar(400),
      record_end_date                                          date,
      create_date                                              timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                              integer            NOT NULL,
      update_date                                              timestamptz(6),
      update_user                                              integer,
      revision_count                                           integer            DEFAULT 0 NOT NULL,
      CONSTRAINT habitat_feature_qualitative_habitat_feature_option_pk PRIMARY KEY (habitat_feature_qualitative_habitat_feature_option_id)
    );

    COMMENT ON TABLE  habitat_feature_qualitative_habitat_feature_option                                          IS 'Qualitative habitat_feature attribute options.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.habitat_feature_qualitative_habitat_feature_option_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.habitat_feature_qualitative_habitat_feature_id           IS 'Foreign key to the habitat_feature_qualitative_habitat_feature table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.name                                     IS 'The name of the option.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.description                              IS 'The description of the option.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.record_end_date                          IS 'Record level end date.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.create_date                              IS 'The datetime the record was created.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.create_user                              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.update_date                              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.update_user                              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN habitat_feature_qualitative_habitat_feature_option.revision_count                           IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE habitat_feature_qualitative_habitat_feature_option
      ADD CONSTRAINT habitat_feature_qualitative_habitat_feature_option_fk1
      FOREIGN KEY (habitat_feature_qualitative_habitat_feature_id)
      REFERENCES habitat_feature_qualitative_habitat_feature(habitat_feature_qualitative_habitat_feature_id);

    -- Add indexes for foreign keys
    CREATE INDEX habitat_feature_qualitative_habitat_feature_option_idx1 ON habitat_feature_qualitative_habitat_feature_option(habitat_feature_qualitative_habitat_feature_id);

    -- Add unique end-date key constraint (don't allow 2 records with the same habitat_feature_qualitative_habitat_feature_id and name and a NULL record_end_date)
    CREATE UNIQUE INDEX habitat_feature_qualitative_habitat_feature_option_nuk1 ON habitat_feature_qualitative_habitat_feature_option(habitat_feature_qualitative_habitat_feature_id, name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add unique composite key constraint
    ALTER TABLE habitat_feature_qualitative_habitat_feature_option
      ADD CONSTRAINT habitat_feature_qualitative_habitat_feature_option_uk1
      UNIQUE (habitat_feature_qualitative_habitat_feature_option_id, habitat_feature_qualitative_habitat_feature_id);

    ----------------------------------------------------------------------------------------
    -- Create survey_habitat_feature table
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature (
      survey_habitat_feature_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                    integer            NOT NULL,
      habitat_feature_id           integer            NOT NULL,
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
    COMMENT ON COLUMN survey_habitat_feature.habitat_feature_id           IS 'A foreign key pointing to the habitat feature table.';
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
        FOREIGN KEY (habitat_feature_id)
        REFERENCES habitat_feature(habitat_feature_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_idx1 ON survey_habitat_feature(survey_id);

    CREATE INDEX survey_habitat_feature_idx2 ON survey_habitat_feature(habitat_feature_id);

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
    COMMENT ON COLUMN survey_habitat_feature_taxon.survey_habitat_feature_id          IS 'A foreign key pointing to the survey habitat feature table.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.itis_tsn                           IS 'The ITIS TSN identifier for the species associated with the observed habitat feature.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.itis_scientific_name               IS 'The scientific name for the species associated with the observed habitat feature.';
    COMMENT ON COLUMN survey_habitat_feature_taxon.comment                            IS 'A foreign key pointing to the survey table.';
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

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_taxon_idx1 ON survey_habitat_feature_taxon(survey_habitat_feature_id);

    ----------------------------------------------------------------------------------------
    -- Create join tables between survey_habitat_feature and habitat_feature_quantitative and habitat_feature_qualitative
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature_quantitative (
      survey_habitat_feature_quantitative_id                    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_habitat_feature_id                                 integer            NOT NULL,
      habitat_feature_quantitative_habitat_feature_id           uuid               NOT NULL,
      value                                                     numeric            NOT NULL,
      create_date                                               timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                               integer            NOT NULL,
      update_date                                               timestamptz(6),
      update_user                                               integer,
      revision_count                                            integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_habitat_feature_quantitative_pk PRIMARY KEY (survey_habitat_feature_quantitative_id)
    );

    COMMENT ON TABLE  survey_habitat_feature_quantitative                                           IS 'This table is intended to track quantitative attributes applied to a particular survey_habitat_feature.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.survey_habitat_feature_quantitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.survey_habitat_feature_id                 IS 'Foreign key to the survey_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.habitat_feature_quantitative_habitat_feature_id           IS 'Foreign key to the habitat_feature_quantitative_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.value                                     IS 'Quantitative data value.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.create_date                               IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.create_user                               IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.update_date                               IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.update_user                               IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_quantitative.revision_count                            IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX survey_habitat_feature_quantitative_uk1 ON survey_habitat_feature_quantitative(survey_habitat_feature_id, habitat_feature_quantitative_habitat_feature_id);

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature_quantitative
      ADD CONSTRAINT survey_habitat_feature_quantitative_fk1
      FOREIGN KEY (survey_habitat_feature_id)
      REFERENCES survey_habitat_feature(survey_habitat_feature_id);

    ALTER TABLE survey_habitat_feature_quantitative
      ADD CONSTRAINT survey_habitat_feature_quantitative_fk2
      FOREIGN KEY (habitat_feature_quantitative_habitat_feature_id)
      REFERENCES habitat_feature_quantitative_habitat_feature(habitat_feature_quantitative_habitat_feature_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_quantitative_idx1 ON survey_habitat_feature_quantitative(survey_habitat_feature_id);

    CREATE INDEX survey_habitat_feature_quantitative_idx2 ON survey_habitat_feature_quantitative(habitat_feature_quantitative_habitat_feature_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_habitat_feature_qualitative (
      survey_habitat_feature_qualitative_id                    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_habitat_feature_id                                integer            NOT NULL,
      habitat_feature_qualitative_habitat_feature_id           uuid               NOT NULL,
      habitat_feature_qualitative_habitat_feature_option_id                    uuid               NOT NULL,
      create_date                                              timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                              integer            NOT NULL,
      update_date                                              timestamptz(6),
      update_user                                              integer,
      revision_count                                           integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_habitat_feature_qualitative_pk PRIMARY KEY (survey_habitat_feature_qualitative_id)
    );

    COMMENT ON TABLE  survey_habitat_feature_qualitative                                          IS 'This table is intended to track qualitative attributes applied to a particular survey_habitat_feature.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.survey_habitat_feature_qualitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.survey_habitat_feature_id                IS 'Foreign key to the survey_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.habitat_feature_qualitative_habitat_feature_id           IS 'Foreign key to the habitat_feature_qualitative_habitat_feature table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.habitat_feature_qualitative_habitat_feature_option_id    IS 'Foreign key to the habitat_feature_qualitative_habitat_feature_option table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.create_date                              IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.create_user                              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.update_date                              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.update_user                              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_habitat_feature_qualitative.revision_count                           IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX survey_habitat_feature_qualitative_uk1 ON survey_habitat_feature_qualitative(survey_habitat_feature_id, habitat_feature_qualitative_habitat_feature_id);

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature_qualitative
      ADD CONSTRAINT survey_habitat_feature_qualitative_fk1
      FOREIGN KEY (survey_habitat_feature_id)
      REFERENCES survey_habitat_feature(survey_habitat_feature_id);

    ALTER TABLE survey_habitat_feature_qualitative
      ADD CONSTRAINT survey_habitat_feature_qualitative_fk2
      FOREIGN KEY (habitat_feature_qualitative_habitat_feature_id)
      REFERENCES habitat_feature_qualitative_habitat_feature(habitat_feature_qualitative_habitat_feature_id);

    ALTER TABLE survey_habitat_feature_qualitative
      ADD CONSTRAINT survey_habitat_feature_qualitative_fk3
      FOREIGN KEY (habitat_feature_qualitative_habitat_feature_option_id)
      REFERENCES habitat_feature_qualitative_habitat_feature_option(habitat_feature_qualitative_habitat_feature_option_id);

    -- Foreign key on both habitat_feature_qualitative_habitat_feature_id and habitat_feature_qualitative_habitat_feature_option_id of
    -- habitat_feature_qualitative_habitat_feature_option to ensure that the combination of those ids in this table has a valid match.
    ALTER TABLE survey_habitat_feature_qualitative
      ADD CONSTRAINT survey_habitat_feature_qualitative_fk4
      FOREIGN KEY (habitat_feature_qualitative_habitat_feature_id, habitat_feature_qualitative_habitat_feature_option_id)
      REFERENCES habitat_feature_qualitative_habitat_feature_option(habitat_feature_qualitative_habitat_feature_id, habitat_feature_qualitative_habitat_feature_option_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_qualitative_idx1 ON survey_habitat_feature_qualitative(survey_habitat_feature_id);

    CREATE INDEX survey_habitat_feature_qualitative_idx2 ON survey_habitat_feature_qualitative(habitat_feature_qualitative_habitat_feature_id);

    CREATE INDEX survey_habitat_feature_qualitative_idx3 ON survey_habitat_feature_qualitative(habitat_feature_qualitative_habitat_feature_option_id);

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_habitat_feature BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_qualitative_habitat_feature_option BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_habitat_feature_option FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_qualitative_habitat_feature_option AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_habitat_feature_option FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature_taxon BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_taxon FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature_taxon AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_taxon FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_habitat_feature_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_habitat_feature_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_habitat_feature_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
    
    CREATE TRIGGER audit_habitat_feature_qualitative_habitat_feature BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_qualitative_habitat_feature AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_qualitative_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_habitat_feature_quantitative_habitat_feature BEFORE INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_quantitative_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_habitat_feature_quantitative_habitat_feature AFTER INSERT OR UPDATE OR DELETE ON biohub.habitat_feature_quantitative_habitat_feature FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Insert initial habitat feature records
    ----------------------------------------------------------------------------------------

    INSERT INTO 
      habitat_feature (name, description)
    VALUES 
      ('Nest', 'A structure for holding eggs or offspring'),
      ('Burrow', 'An excavated hole that descends below ground for denning, sheltering, or foraging'),
      ('Den', 'An excavated cavity that descends below ground or under a tree root system for denning'),
      ('Mineral lick', 'A naturally occurring mineral deposit with evidence of use by species'),
      ('Wallow', 'An area of mud or shallow water that species roll or relax in, often leaving a depression in the ground'),
      ('Hibernaculum', 'A cavity or structure that species use to hibernate'),
      ('Roost', 'A structure where species aggregate for rest or sleep'),
      ('Hot spring', 'A source of water that is heated geothermally and comes to the surface, as a seep or forming a pool');
  
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
