import { Knex } from 'knex';

/**
 * Create new tables:

 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    -------------------------------------------------------------------------
    -- Create tables
    -------------------------------------------------------------------------
    SET search_path = biohub;

    CREATE TABLE cb_measurements_lookup(
      cb_measurements_lookup_id     integer                 GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      rank                          varchar(50)             NOT NULL,
      tsn                           integer                 NOT NULL,
      measurement                   varchar(50)             NOT NULL,
      unit                          varchar(50),
      type                          varchar(50)             NOT NULL,
      options                       varchar(200),
      description                   varchar(250),
      create_date                   timestamptz(6)          DEFAULT now() NOT NULL,
      create_user                   integer                 NOT NULL,
      update_date                   timestamptz(6),
      update_user                   integer,
      revision_count                integer                 DEFAULT 0 NOT NULL,
      CONSTRAINT cb_measurements_lookup_pk PRIMARY KEY (cb_measurements_lookup_id)
    );

    COMMENT ON COLUMN cb_measurements_lookup.cb_measurements_lookup_id      IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN cb_measurements_lookup.rank                           IS 'The rank of the taxon.';
    COMMENT ON COLUMN cb_measurements_lookup.tsn                            IS 'The taxonomic serial number.';
    COMMENT ON COLUMN cb_measurements_lookup.measurement                    IS 'The measurement value.';
    COMMENT ON COLUMN cb_measurements_lookup.unit                           IS 'The unit of measurement.';
    COMMENT ON COLUMN cb_measurements_lookup.type                           IS 'The type of measurement.';
    COMMENT ON COLUMN cb_measurements_lookup.options                        IS 'The options for the measurement.';
    COMMENT ON COLUMN cb_measurements_lookup.description                    IS 'The description of the measurement.';
    COMMENT ON COLUMN cb_measurements_lookup.create_date                    IS 'The datetime the record was created.';
    COMMENT ON COLUMN cb_measurements_lookup.create_user                    IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN cb_measurements_lookup.update_date                    IS 'The datetime the record was updated.';
    COMMENT ON COLUMN cb_measurements_lookup.update_user                    IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN cb_measurements_lookup.revision_count                 IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  cb_measurements_lookup                                IS 'A measurement lookup table.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_observation_measurement (
        survey_observation_measurement_id    integer                 GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        survey_observation_id                integer                 NOT NULL,
        cb_measurements_lookup_id            integer                 NOT NULL,
        value                                integer                 NOT NULL,
        create_date                          timestamptz(6)          DEFAULT now() NOT NULL,
        create_user                          integer                 NOT NULL,
        update_date                          timestamptz(6),
        update_user                          integer,
        revision_count                       integer                 DEFAULT 0 NOT NULL,
        CONSTRAINT survey_observation_measurement_pk PRIMARY KEY (survey_observation_measurement_id)
    );

    COMMENT ON COLUMN survey_observation_measurement.survey_observation_measurement_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_observation_measurement.survey_observation_id             IS 'The id of the survey observation as identified in the survey observation table.';
    COMMENT ON COLUMN survey_observation_measurement.cb_measurements_lookup_id         IS 'The id of the measurement as identified in the cb_measurements_lookup table.';
    COMMENT ON COLUMN survey_observation_measurement.value                             IS 'The value of the measurement.';
    COMMENT ON COLUMN survey_observation_measurement.create_date                       IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_observation_measurement.create_user                       IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_observation_measurement.update_date                       IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_observation_measurement.update_user                       IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_observation_measurement.revision_count                    IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  survey_observation_measurement                                   IS 'A table to store the measurements for a survey observation.';

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: survey_observation_measurement
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint
    ALTER TABLE survey_observation_measurement ADD CONSTRAINT survey_observation_measurement_fk1
      FOREIGN KEY (survey_observation_id)
      REFERENCES survey_observation(survey_observation_id);

    ALTER TABLE survey_observation_measurement ADD CONSTRAINT survey_observation_measurement_fk2
      FOREIGN KEY (cb_measurements_lookup_id)
      REFERENCES cb_measurements_lookup(cb_measurements_lookup_id);

    -- add indexes for foreign keys
    CREATE INDEX survey_observation_measurement_idx1 ON survey_observation(survey_observation_id);
    CREATE INDEX survey_observation_measurement_idx2 ON cb_measurements_lookup(cb_measurements_lookup_id);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_cb_measurements_lookup_lookup BEFORE INSERT OR UPDATE OR DELETE ON biohub.cb_measurements_lookup FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_cb_measurements_lookup_lookup AFTER INSERT OR UPDATE OR DELETE ON biohub.cb_measurements_lookup FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_observation_measurement BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_observation_measurement FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_observation_measurement AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_observation_measurement FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Create lookup table data
    ----------------------------------------------------------------------------------------
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('vertebrata', 331030, 'skull length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('vertebrata', 331030, 'skull width', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('tetrapoda', 914181, 'neck girth', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('tetrapoda', 914181, 'neck length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('sciuridae', 180135, 'nest height', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('reptilia', 173747, 'snout-vent length', 'mm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('reptilia', 173747, 'body length', 'mm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('reptilia', 173747, 'body mass', 'g', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('plantae', 202422, 'Diameter at breast height (DBH)', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'baculum length', 'cm', 'quant', 'The length of the baculum bone, measured from start to end.', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'chest girth', 'cm', 'quant', 'The circumference of the chest, measured at the largest point.', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'abdomen girth', 'cm', 'quant', 'The circumference of the abdomen, measured at the largest point.', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'canine length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'canine width', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'ear length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'forearm length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'hind leg length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'foot length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'paw length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'paw width', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'foot width', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'hallux length', 'cm', 'quant', 'Length of the hallux toe, measured from base to tip.', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'nipple length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'shoulder height', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'shoulder width', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'body length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'body mass', 'kg', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'fur colour (primary)', '', 'qual', 'black, brown, white, grey, orange', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('mammalia', 179913, 'fur colour (secondary)', '', 'qual', 'black, brown, white, grey, orange', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'cere depth', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'culmen length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'culmen width', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'nest diameter (inner)', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'nest diameter (outer)', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'cavity opening diameter', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'life stage', '', 'qual', 'nestling, fledgling, hatch year (HY), after hatch year (AHY)', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'nest height', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'body mass', 'g', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'tarsus length', 'mm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'tarsus width', 'mm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('aves', 174371, 'wing chord', 'mm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('artiodactyla', 180692, 'antler point count', '', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('artiodactyla', 180692, 'antler configuration', '', 'qual', 'less than 3 points; more than 3 points', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('animalia', 202423, 'age', 'years', 'quant', 'The number of years that the animal has been alive for', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('animalia', 202423, 'offspring count', '', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('animalia', 202423, 'tail length', 'cm', 'quant', '', '', 1);
    INSERT INTO cb_measurements_lookup(rank, tsn, measurement, unit, type, options, description, create_user)
    VALUES ('animalia', 202423, 'sex', '', 'qual', 'male, female', '', 1);

    ----------------------------------------------------------------------------------------
    -- Create new views
    ----------------------------------------------------------------------------------------
    SET search_path=biohub_dapi_v1;

    CREATE OR REPLACE VIEW cb_measurements_lookup AS SELECT * FROM biohub.cb_measurements_lookup;
    CREATE OR REPLACE VIEW survey_observation_measurement AS SELECT * FROM biohub.survey_observation_measurement;
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
