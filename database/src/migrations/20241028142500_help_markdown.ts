import { Knex } from 'knex';

/**
 * Add tables to store versioned text displayed in help dialogs. Versions can be up-voted or down-voted by users.
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
    
    -- Add unique end-date index
    CREATE UNIQUE INDEX markdown_nuk1 ON markdown(markdown_type_id, (record_end_date is NULL)) where record_end_date is null;

    CREATE INDEX markdown_idx1 ON markdown(markdown_type_id);

    CREATE TRIGGER audit_markdown BEFORE INSERT OR UPDATE OR DELETE ON markdown FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_markdown AFTER INSERT OR UPDATE OR DELETE ON markdown FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create table for tracking which users have voted on markdown records (only 1 vote per user)
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
    COMMENT ON COLUMN markdown_user.system_user_id IS 'The id of the user who voted on the markdown record.';
    COMMENT ON COLUMN markdown_user.markdown_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN markdown_user.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN markdown_user.create_user IS 'The id of the user who created the record.';
    COMMENT ON COLUMN markdown_user.update_date IS 'The datetime the record was last updated.';
    COMMENT ON COLUMN markdown_user.update_user IS 'The id of the user who last updated the record.';
    COMMENT ON COLUMN markdown_user.revision_count IS 'Revision count used for concurrency control.';
    
    ALTER TABLE markdown_user ADD CONSTRAINT markdown_user_fk1 FOREIGN KEY (markdown_id) REFERENCES markdown(markdown_id);
    ALTER TABLE markdown_user ADD CONSTRAINT markdown_user_fk2 FOREIGN KEY (system_user_id) REFERENCES system_user(system_user_id);

    CREATE INDEX markdown_user_idx1 ON markdown_user(system_user_id);
    CREATE INDEX markdown_user_idx2 ON markdown_user(markdown_id);

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
        ('Survey Metadata', 'Help text about survey metadata.');

    INSERT INTO
        markdown (markdown_type_id, data)
    VALUES
        (1, '## Projects and Surveys\n\nProjects and Surveys let you organize and manage access to ecological data. You can think of Projects and Surveys as folders and subfolders, respectively.\n\n#### Projects\nYou can invite other users to a Project to give them access to information in the Project. All of the Projects you have created or been invited to will appear in your Projects list. If you need access to a Project created by your collaborator, your collaborator can invite you.\n\n#### Surveys\nSurveys let you organize ecological data collected in the field. When you return from the field with new data, you can choose to create a new Survey or add the data to an existing Survey. If you do multiple fieldwork trips with a common goal, such as checking hair snares every three months, we recommend adding new data to the existing Survey representing why you are collecting hair.\n\n#### Access to Surveys\nSurveys must belong to a Project, which determines who can access them. To give someone access to a Survey, you can invite them to the Project. To revoke access, you can remove them from the Project. The development team is working on providing more granular access to specific Surveys in a Project...'),
        (2, '## Data\n\nThis section lets you view all of the data that you have access to, combining data across surveys. When you add data to a Survey, those data will show up here. If you are looking for something specific, you can filter the data using search criteria.'),
        (3, '## Sampling Information\n\nThis section covers when, where, and how you collected data for this survey.\n\n#### Sampling Sites\nSampling sites are the exact spots where you collected data. They can be points, lines, or areas, depending on your study design. If you’re unsure about what your sites are, use locations that best represent where you actually went, not the larger area you’re studying.\n\n#### Sampling Techniques\nTechniques are the methods you used to collect data. When you create a technique, you’ll pick a general sampling method that the technique represents, like camera trap, hair snare, or visual encounter. Next, you’ll add extra details about how you did that method, like the type of camera used and the number of images per trigger.\n\n#### Sampling Periods\nSampling periods describe when you collected data at each site. They help explain your data: was the species not seen because it wasn’t there, or because sampling hadn’t started yet? Sampling periods are also valuable for providing information about sampling effort...'),
        (4, '## Survey Data\n\nThis section includes the data collected during your survey.\n\n#### Observations\nObservations are sightings or counts of species. Observations can include the species, location, date, time, count, and any other information you recorded, such as temperature or life stage. Instead of formatting data into a fixed template, you are able to build your own template to match your data.\n\n#### Animals\nAnimals represent individuals that you captured or marked during your survey. After creating an animal, you can add capture and mortality events. You can indicate any markings that you applied or measurements that you recorded during each event.\n\n#### Telemetry\nTelemetry data shows animal movements recorded by GPS devices. To add telemetry data, start by adding device deployments to animals in your survey...'),
        (5, '## Project Details\n\nThis section shows the objectives and members of the Project. You can edit this information by editing the Project using the settings button.\n\n#### Team Members\nTeam members can access all information in the Project, but only members with the Coordinator and Collaborator role can edit and add new information. You can change the role of a team member when editing the Project.\n\n###### Coordinators\nCoordinators manage the Project, including inviting new team members, adding and editing data, and publishing Surveys to BiodiversityHub BC. A Project can have multiple Coordinators.\n\n###### Collaborators\nCollaborators can add and edit data, including create new Surveys, but they cannot invite team members or publish Surveys to BiodiversityHub BC.\n\n###### Observers\nObservers have view-only access to information. This role is ideal for those who need access without the need to contribute any new information...'),
        (6, '## Surveys\n\nThis section shows Surveys in the Project. Surveys contain the actual data being managed, such as species observations. The value of Surveys is to help organize data.'),
        (7, '## Survey Page\n\nThis page shows the details of a specific Survey.\n\n#### Components of a Survey\nSurveys can include sampling information, data, attachments, and metadata. Sampling information describes precisely where, when, and how data were collected. Survey data represents what was recorded while sampling, such as species observations. Attachments provide supplementary information not captured in the data, such as detailed maps of the study area. Metadata is the information entered when the Survey was created, such as the start and end dates and objectives. This provides important context for understanding the data.\n\n###### Editing the Survey\nProject Coordinators and Collaborators can edit the Survey metadata using the Settings button. Coordinators and Collaborators can add and edit sampling information, survey data, and attachments in the sections below.\n\n###### Publishing\nCoordinators can publish the Survey to BiodiversityHub BC to share information with a wider audience. If information changes after publishing, a new version can be published...'),
        (8, '## Techniques\n\nTechniques represent the sampling methods used to collect data at a sampling site. If you collected data in multiple ways, such as setting up camera traps and walking along transects, you should create multiple techniques. After creating techniques, you will be able to apply them to sampling sites...'),
        (9, '## Sampling Sites\n\nSampling sites are the exact locations where you collected data. Sites can be points, lines, or areas on the map. For example, if you used transects, you could use lines to represent each transect. If you surveyed a large area, you could use polygons to represent each area.\n\n#### What is my Sampling Site?\nSampling sites represent where you had a chance to collect data. Entering precise site locations helps understand why data might not exist in a certain area. If there’s an area with no observations or sites, it’s safe to assume the area wasn’t sampled.\n\n#### Revisiting Sites from an Earlier Survey\nIf you’re collecting data at a site from a previous Survey, you’ll need to add a new site at the same location. This allows you to make updates if the site has changed without affecting the original Survey. Each survey is also designed to be a standalone set of information. Adding a new site at the same location keeps the data organized and easy to manage. To know which sites are the same, you can look for sites with matching or similar locations...'),
        (10, '## Survey Metadata\n\nThis section includes metadata related to the survey...');

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
