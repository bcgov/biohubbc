import { Knex } from 'knex';

/**
 * Table for user-specific survey filters
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- SURVEY FILTER
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_filter (
        survey_filter_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        system_user_id           INTEGER           NOT NULL,
        name                     varchar(20)       NOT NULL,
        conditions               jsonb             NOT NULL,
        description              varchar(500),
        create_date              timestamptz(6)    DEFAULT now() NOT NULL,
        create_user              integer           NOT NULL,
        update_date              timestamptz(6),
        update_user              integer,
        revision_count           integer           DEFAULT 0 NOT NULL,
        CONSTRAINT survey_filter_pk PRIMARY KEY (survey_filter_id),
        CONSTRAINT survey_filter_system_user_fk FOREIGN KEY (system_user_id) REFERENCES "system_user" (system_user_id)
    );

    CREATE INDEX survey_filter_idx ON survey_filter (system_user_id);

    COMMENT ON COLUMN survey_filter.survey_filter_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_filter.name IS 'The name of the survey filter.';
    COMMENT ON COLUMN survey_filter.system_user_id IS 'The user that the filter is assigned to';
    COMMENT ON COLUMN survey_filter.conditions IS 'The filter parameters.';
    COMMENT ON COLUMN survey_filter.description IS 'Description of the survey filter.';
    COMMENT ON COLUMN survey_filter.create_date IS 'Timestamp when the record was created.';
    COMMENT ON COLUMN survey_filter.create_user IS 'User ID who created the record.';
    COMMENT ON COLUMN survey_filter.update_date IS 'Timestamp when the record was last updated.';
    COMMENT ON COLUMN survey_filter.update_user IS 'User ID who last updated the record.';
    COMMENT ON COLUMN survey_filter.revision_count IS 'Revision count for concurrency control.';
    COMMENT ON TABLE survey_filter IS 'Survey filters for participants in a survey.';

    create trigger audit_survey_filter before insert or update or delete on survey_filter for each row execute procedure tr_audit_trigger();
    create trigger journal_survey_filter after insert or update or delete on survey_filter for each row execute procedure tr_journal_trigger();
      `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
