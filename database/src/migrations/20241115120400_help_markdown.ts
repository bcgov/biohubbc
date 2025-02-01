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

    COMMENT ON TABLE markdown_type IS 'Table to store types of markdown documents.';
    COMMENT ON COLUMN markdown_type.markdown_type_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN markdown_type.name IS 'Name of the markdown type.';
    COMMENT ON COLUMN markdown_type.description IS 'Description of the markdown type.';
    COMMENT ON COLUMN markdown_type.record_end_date IS 'Date when the record was marked as inactive.';
    COMMENT ON COLUMN markdown_type.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN markdown_type.create_user IS 'The id of the user who created the record.';
    COMMENT ON COLUMN markdown_type.update_date IS 'The datetime the record was last updated.';
    COMMENT ON COLUMN markdown_type.update_user IS 'The id of the user who last updated the record.';
    COMMENT ON COLUMN markdown_type.revision_count IS 'Revision count used for concurrency control.';

    CREATE TRIGGER audit_markdown_type BEFORE INSERT OR UPDATE OR DELETE ON markdown_type FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_markdown_type AFTER INSERT OR UPDATE OR DELETE ON markdown_type FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

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

    COMMENT ON TABLE markdown IS 'Table to store markdown records associated with markdown types.';
    COMMENT ON COLUMN markdown.markdown_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN markdown.markdown_type_id IS 'Foreign key reference to the markdown type.';
    COMMENT ON COLUMN markdown.data IS 'The content of the markdown document.';
    COMMENT ON COLUMN markdown.score IS 'Score or ranking associated with the markdown document.';
    COMMENT ON COLUMN markdown.record_end_date IS 'Date when the record was marked as inactive.';
    COMMENT ON COLUMN markdown.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN markdown.create_user IS 'The id of the user who created the record.';
    COMMENT ON COLUMN markdown.update_date IS 'The datetime the record was last updated.';
    COMMENT ON COLUMN markdown.update_user IS 'The id of the user who last updated the record.';
    COMMENT ON COLUMN markdown.revision_count IS 'Revision count used for concurrency control.';

    ALTER TABLE markdown ADD CONSTRAINT markdown_fk1 FOREIGN KEY (markdown_type_id) REFERENCES markdown_type(markdown_type_id);

    CREATE INDEX markdown_idx1 ON markdown(markdown_type_id);

    -- Add unique end-date index
    CREATE UNIQUE INDEX markdown_nuk1 ON markdown(markdown_type_id, (record_end_date is NULL)) where record_end_date is null;

    CREATE TRIGGER audit_markdown BEFORE INSERT OR UPDATE OR DELETE ON markdown FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_markdown AFTER INSERT OR UPDATE OR DELETE ON markdown FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

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

    COMMENT ON TABLE markdown_user IS 'Table to store markdown records associated with markdown types.';
    COMMENT ON COLUMN markdown_user.system_user_id IS 'The id of the user who scored on the markdown record.';
    COMMENT ON COLUMN markdown_user.markdown_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN markdown_user.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN markdown_user.create_user IS 'The id of the user who created the record.';
    COMMENT ON COLUMN markdown_user.update_date IS 'The datetime the record was last updated.';
    COMMENT ON COLUMN markdown_user.update_user IS 'The id of the user who last updated the record.';
    COMMENT ON COLUMN markdown_user.revision_count IS 'Revision count used for concurrency control.';

    ALTER TABLE markdown_user ADD CONSTRAINT markdown_user_fk1 FOREIGN KEY (markdown_id) REFERENCES markdown(markdown_id);
    ALTER TABLE markdown_user ADD CONSTRAINT markdown_user_fk2 FOREIGN KEY (system_user_id) REFERENCES "system_user"(system_user_id);

    CREATE INDEX markdown_user_idx1 ON markdown_user(system_user_id);
    CREATE INDEX markdown_user_idx2 ON markdown_user(markdown_id);

    CREATE UNIQUE INDEX markdown_user_uk1 ON markdown_user(markdown_id, system_user_id);

    CREATE TRIGGER audit_markdown_user BEFORE INSERT OR UPDATE OR DELETE ON markdown_user FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_markdown_user AFTER INSERT OR UPDATE OR DELETE ON markdown_user FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Insert markdown for dialogs
    ----------------------------------------------------------------------------------------
    INSERT INTO
        markdown_type (name, description)
    VALUES
        ('Projects and Surveys', 'Help text about Projects and Surveys'),
        ('Summary Data', 'Help text about all the data that a user has access to'),
        ('Sampling Information', 'Help text about sampling methods and information.'),
        ('Survey Data', 'Help text about data collected during surveys.'),
        ('Project Details', 'Help text about project details.'),
        ('Surveys', 'Help text about surveys.'),
        ('Survey Page', 'Help text about survey pages.'),
        ('Techniques', 'Help text about techniques used for sampling.'),
        ('Sampling Sites', 'Help text about sampling sites.'),
        ('Survey Metadata', 'Help text about survey metadata.'),
        ('Observations', 'Help text about the observations manage page.');

    INSERT INTO
        markdown (markdown_type_id, data)
    VALUES
        (1, '## Projects and Surveys\n\nProjects and Surveys let you organize and manage access to data.\n\n##### Projects\nProjects are folders containing information that is only accessible to the Project team.\n- All Projects you have created or been invited to will appear in your Projects list.\n- If you need access to an existing Project, your collaborator can invite you.\n\n##### Surveys\nSurveys let you organize ecological data collected in the field.\n- When adding new data, you can create a new Survey or add to an existing Survey.'),
        (2, '## Data\n\nThis section lets you view all data that you have access to, combining data across Surveys.\n- When data is added to one of your Surveys, those data will also show up here.\n- If you are looking for specific data, you can filter the data using search criteria.'),
        (3, '## Sampling Information\n\nThis section covers where, when, and how you collected data for the Survey.\n\n##### Sampling Techniques\nTechniques are the methods used to collect data.\n- When you create a technique, you’ll select a general method that the technique represents (e.g., camera trap).\n- You can add extra details about how you did that method, like the type of camera used.\n\n##### Sampling Sites\nSites are the precise locations where you collected data.\n- They can be points, lines, or areas.\n- Use locations that best represent where you actually went, not the larger area you’re studying.\n\n##### Sampling Periods\nPeriods describe when you did a technique at a sampling site.\n- They help explain your data: was the species not seen because it wasn’t there, or because sampling hadn’t started yet\\?\n- They provide valuable information about sampling effort, helping compare datasets.'),
        (4, '## Survey Data\n\nThis section shows data collected during your Survey.\n\n##### Observations\nObservations are sightings or counts of species.\n- Observations can include a species, location, time, count, environmental variables, and species-specific attributes.\n- The [Standards Page](https://sims.nrs.gov.bc.ca/standards) shows fields that can be added to observations.\n\n##### Animals\nAnimals represent individuals that you captured or marked during your Survey.\n- After creating an animal, you can add capture and mortality events.\n- You can record each animal’s markings and measurements.\n\n##### Telemetry\nTelemetry data shows animal movements recorded by GPS devices.\n- To add telemetry data, you must first add the animals and then add deployments.'),
        (5, '## Project Details\n\nThis section shows the objectives and members of the Project.\n\n##### Team Members\nThe role of each team member determines their permissions in the Project.\n\n###### Coordinators\n- Able to manage the Project itself.\n- Can invite new team members, add and edit data, and publish Surveys to BiodiversityHub BC.\n- A Project can have multiple Coordinators.\n\n###### Collaborators\n- Collaborators can add and edit data.\n- Able to create new Surveys.\n- Cannot invite team members or publish Surveys to BiodiversityHub BC.\n\n###### Observers\n- View-only access to information.'),
        (6, '## Surveys\n\nThis section shows Surveys in the Project.\n- Surveys contain ecological data like species observations.\n- When you return from the field with new data, you can choose to create a new Survey or add to an existing Survey.'),
        (7, '## Survey Page\n\nThis page shows the details of a specific Survey.\n\n##### Parts of a Survey\nSurveys involve sampling information, data, attachments, and metadata.\n- Sampling information describes precisely where, when, and how data were collected.\n- Survey data represents what was recorded while sampling (e.g., species observations).\n- Attachments provide supplementary information not captured in the data.\n- Metadata includes information entered when the Survey was created (e.g., start and end dates, objectives).\n\n##### Updating Surveys\n- Project Coordinators and Collaborators can edit all information in the Survey.\n\n##### Publishing\nCoordinators can publish the Survey to BiodiversityHub BC.\n- If information changes after publishing, a new version can be published.'),
        (8, '## Techniques\n\nTechniques represent the sampling methods used to collect data at a sampling site.\n- They indicate how you intended to sample, ignoring site-specific adjustments you made.\n- You can record site-specific adjustments when applying the technique.\n- If you collected data in multiple ways, you can create multiple techniques.\n- After creating techniques, you can apply them to sampling sites.'),
        (9, '## Sampling Sites\n\nSampling sites are the exact locations where you collected data.\n- Sites can be points, lines, or areas on the map.\n- You can represent transects or routes with lines.\n\n##### What is my Sampling Site\\?\nSampling sites should be the most precise location you have for where you collected data.\n- Precise locations help explain why data doesn’t exist in a certain area.\n- If there’s an area with no observations or sites, it’s safe to assume the area wasn’t sampled.\n\n##### Revisiting Sites from an Earlier Survey\nIf you’re collecting data at a site from a previous Survey, you’ll need to add a new site at the same location.\n- This allows you to make updates if the site was slightly different without affecting the original Survey.\n- Adding a new site at the same location keeps the data organized and easier to manage.'),
        (10, '## Survey Metadata\n\nThis section includes metadata about the Survey.\n- You can update this information by editing the Survey.'),
        (11, '## Observations\n\nObservations are sightings or counts of species.\n\n##### Configuring the Table\nYou can add columns to the observations table to match your data.\n- The [Standards Page](https://sims.nrs.gov.bc.ca/standards) shows possible columns and allowed values for each.\n\n##### Importing\n- You can import observations from a .csv file.\n- Your .csv columns should exactly match what you see in the observations table.\n- You can import data with extra columns without configuring the table; the table will be configured based on your imported data.\n- You can download an sample .csv to see a working example.\n\n##### Editing\n- You can start editing a row by double clicking it.\n- You can comment on an observation by clicking the comment icon in the last column.\n- You must click SAVE to save your changes.');


    ----------------------------------------------------------------------------------------
    -- Create view
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH = biohub_dapi_v1;

    CREATE VIEW markdown AS SELECT * FROM biohub.markdown;
    CREATE VIEW markdown_type AS SELECT * FROM biohub.markdown_type;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
