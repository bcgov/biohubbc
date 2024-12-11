import { Knex } from 'knex';

/**
 * Add tables to store versioned text displayed in help dialogs. Versions can be up-scored or down-scored by users.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub, public;

    ----------------------------------------------------------------------------------------
    -- Create markdown_type table
    ----------------------------------------------------------------------------------------

    CREATE TABLE markdown_type (
        markdown_type_id               integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                           varchar(25)        NOT NULL,
        description                    varchar(400)       NOT NULL,
        record_end_date                date,
        create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
        create_user                    integer            NOT NULL,
        update_date                    timestamptz(6),
        update_user                    integer,
        revision_count                 integer            DEFAULT 0 NOT NULL,
        CONSTRAINT markdown_type_pk PRIMARY KEY (markdown_type_id)
    );

    ----------------------------------------------------------------------------------------
    -- Create markdown table
    ----------------------------------------------------------------------------------------

    CREATE TABLE markdown (
        markdown_id                    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        markdown_type_id               integer            NOT NULL,
        data                           varchar            NOT NULL,
        score                          integer            DEFAULT 0 NOT NULL,
        record_end_date                date,
        create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
        create_user                    integer            NOT NULL,
        update_date                    timestamptz(6),
        update_user                    integer,
        revision_count                 integer            DEFAULT 0 NOT NULL,
        CONSTRAINT markdown_pk PRIMARY KEY (markdown_id)
    );

    ----------------------------------------------------------------------------------------
    -- Create table for tracking which users have scored on markdown records (only 1 score per user)
    ----------------------------------------------------------------------------------------

    CREATE TABLE markdown_user (
        markdown_user_id               integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        system_user_id                 integer            NOT NULL,
        markdown_id                    integer            NOT NULL,
        create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
        create_user                    integer            NOT NULL,
        update_date                    timestamptz(6),
        update_user                    integer,
        revision_count                 integer            DEFAULT 0 NOT NULL,
        CONSTRAINT markdown_user_pk PRIMARY KEY (markdown_user_id)
    );

    ----------------------------------------------------------------------------------------
    -- Insert markdown for dialogs
    ----------------------------------------------------------------------------------------
    INSERT INTO
        markdown_type (name, description)
    VALUES
        ('supportGeneral', 'Help text about Support pages'),
        ('supportTelemetry', 'Help text regarding telemetry'),
        (supportTelemtryBulk, 'Help text for telemtry bulk upload');

        
    INSERT INTO
        markdown (markdown_type_id, data)
    VALUES
        (1, '## Projects and Surveys\n\nProjects and Surveys let you organize and manage access to data.\n\n##### Projects\nProjects are folders containing information that is only accessible to the Project team.\n- All Projects you have created or been invited to will appear in your Projects list.\n- If you need access to an existing Project, your collaborator can invite you.\n\n##### Surveys\nSurveys let you organize ecological data collected in the field.\n- When adding new data, you can create a new Survey or add to an existing Survey.');


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
