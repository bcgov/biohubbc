import { Knex } from 'knex';

/**
 * New table:
 * - survey_progress
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Create tables for survey_checklist to map checklists to survey_ids from survey
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_checklist (
      survey_checklist_id integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id          integer            NOT NULL,
      checklist_id       integer            NOT NULL,
      record_end_date    date,
      create_date        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user        integer            NOT NULL,
      update_date        timestamptz(6),
      update_user        integer,
      revision_count     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_checklist_pk PRIMARY KEY (survey_checklist_id)
    );

    COMMENT ON TABLE  survey_checklist                    IS 'Stores relationships between checklist_id and survey_id .';
    COMMENT ON COLUMN survey_checklist.survey_checklist_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_checklist.survey_id          IS 'Survey_id from survey table.';
    COMMENT ON COLUMN survey_checklist.checklist_id       IS 'The id of the checklist from the checklist table.';
    COMMENT ON COLUMN survey_checklist.record_end_date    IS 'Record level end date.';
    COMMENT ON COLUMN survey_checklist.create_date        IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_checklist.create_user        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_checklist.update_date        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_checklist.update_user        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_checklist.revision_count     IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Create tables for checklist
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist (
      checklist_id       integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name               varchar(100)       NOT NULL,
      description        varchar(100)       NOT NULL,
      record_end_date    date,
      create_date        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user        integer            NOT NULL,
      update_date        timestamptz(6),
      update_user        integer,
      revision_count     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_pk PRIMARY KEY (checklist_id)
    );

    COMMENT ON TABLE  checklist                    IS 'Stores individual checklists.';
    COMMENT ON COLUMN checklist.checklist_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist.name               IS 'The name of the checklist.';
    COMMENT ON COLUMN checklist.description        IS 'The description of the checklist and its intended use case.';
    COMMENT ON COLUMN checklist.record_end_date    IS 'Record level end date.';
    COMMENT ON COLUMN checklist.create_date        IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist.create_user        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist.update_date        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist.update_user        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist.revision_count     IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Create new table for checklist_definition
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist_definition (
      checklist_definition_id   integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      checklist_id              integer            NOT NULL,
      checklist_item_id         integer            NOT NULL,
      record_end_date           date,
      create_date               timestamptz(6)     DEFAULT now() NOT NULL,
      create_user               integer            NOT NULL,
      update_date               timestamptz(6),
      update_user               integer,
      revision_count            integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_definition_pk PRIMARY KEY (checklist_definition_id)
    );

    COMMENT ON TABLE  checklist_definition                          IS 'Maps checklist_id to checklist_item_id .';
    COMMENT ON COLUMN checklist_definition.checklist_definition_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist_definition.checklist_id             IS 'The id of the checklist.';
    COMMENT ON COLUMN checklist_definition.checklist_item_id        IS 'The id of the checklist item.';
    COMMENT ON COLUMN checklist_definition.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN checklist_definition.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist_definition.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_definition.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist_definition.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_definition.revision_count           IS 'Revision count used for concurrency control.';



    ----------------------------------------------------------------------------------------
    -- Create new table for checklist_item
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist_item (
      checklist_item_id         integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                      varchar(50)        NOT NULL,
      checklist_item_category_id        integer   NOT NULL,
      record_end_date           date,
      create_date               timestamptz(6)     DEFAULT now() NOT NULL,
      create_user               integer            NOT NULL,
      update_date               timestamptz(6),
      update_user               integer,
      revision_count            integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_item_pk PRIMARY KEY (checklist_item_id)
    );

    COMMENT ON TABLE  checklist_item                          IS 'Maps checklist_item_category_id to checklist_item_id .';
    COMMENT ON COLUMN checklist_item.checklist_item_id        IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist_item.name                     IS 'The name of the checklist item.';
    COMMENT ON COLUMN checklist_item.checklist_item_category_id        IS 'The id of the checklist item category.';
    COMMENT ON COLUMN checklist_item.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN checklist_item.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist_item.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_item.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist_item.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_item.revision_count            IS 'Revision count used for concurrency control.';

  ----------------------------------------------------------------------------------------
    -- Create new table for checklist_item_category
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist_item_category  (
      checklist_item_category_id   integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                      varchar(50)         NOT NULL,
      description               varchar(100)        NOT NULL,
      record_end_date           date,
      create_date               timestamptz(6)     DEFAULT now() NOT NULL,
      create_user               integer            NOT NULL,
      update_date               timestamptz(6),
      update_user               integer,
      revision_count            integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_item_category_pk PRIMARY KEY (checklist_item_category_id)
    );

    COMMENT ON TABLE  checklist_item_category                                     IS 'Look up for checklist category. Maps checklist_item to a checklist category.';
    COMMENT ON COLUMN checklist_item_category.checklist_item_category_id          IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist_item_category.name                                IS 'The name of the checklist category.';
    COMMENT ON COLUMN checklist_item_category.description                         IS 'The description of the checklist category.';
    COMMENT ON COLUMN checklist_item_category.record_end_date                     IS 'Record level end date.';
    COMMENT ON COLUMN checklist_item_category.create_date                         IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist_item_category.create_user                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_item_category.update_date                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist_item_category.update_user                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_item_category.revision_count                      IS 'Revision count used for concurrency control.';



    ----------------------------------------------------------------------------------------
    -- Create triggers
    ----------------------------------------------------------------------------------------

    ----------------------------------------------------------------------------------------
    -- Create constraints/indexes on foreign keys
    ----------------------------------------------------------------------------------------
        
    ALTER TABLE survey_checklist ADD CONSTRAINT fk_survey_checklist_checklist
        FOREIGN KEY (checklist_id) REFERENCES checklist(checklist_id);

    ALTER TABLE checklist_definition ADD CONSTRAINT fk_checklist_definition_checklist
        FOREIGN KEY (checklist_id) REFERENCES checklist(checklist_id);
        
    ALTER TABLE checklist_definition ADD CONSTRAINT fk_checklist_definition_item
        FOREIGN KEY (checklist_item_id) REFERENCES checklist_item(checklist_item_id);

    ALTER TABLE checklist_item ADD CONSTRAINT fk_checklist_item_category
        FOREIGN KEY (checklist_item_category_id) REFERENCES checklist_item_category(checklist_item_category_id);

    CREATE INDEX idx_survey_checklist_checklist_id ON survey_checklist(checklist_id);
    CREATE INDEX idx_checklist_definition_checklist_id ON checklist_definition(checklist_id);
    CREATE INDEX idx_checklist_definition_item_id ON checklist_definition(checklist_item_id);
    CREATE INDEX idx_checklist_item_category_id ON checklist_item(checklist_item_category_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
