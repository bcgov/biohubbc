--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      BioHub.DM1
--
-- Date Created : Monday, March 08, 2021 15:52:34
-- Target DBMS : PostgreSQL 10.x-12.x
--

-- 
-- TABLE: activity 
--

CREATE TABLE activity(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_3_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN activity.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN activity.name IS 'Name of the First Nation.'
;
COMMENT ON COLUMN activity.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN activity.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN activity.description IS 'The description of the record.'
;
COMMENT ON COLUMN activity.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN activity.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN activity.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN activity.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN activity.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE activity IS 'A list of project activities.'
;

-- 
-- TABLE: ancillary_species 
--

CREATE TABLE ancillary_species(
    id                          integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                        varchar(300)     NOT NULL,
    p_id                        integer          NOT NULL,
    uniform_resource_locator    varchar(2000),
    create_date                 timestamp(6)     DEFAULT now() NOT NULL,
    create_user                 integer          NOT NULL,
    update_date                 timestamp(6),
    update_user                 integer,
    revision_count              integer          DEFAULT 0 NOT NULL,
    CONSTRAINT pk122_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN ancillary_species.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN ancillary_species.name IS 'The name of the anciliary species.'
;
COMMENT ON COLUMN ancillary_species.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN ancillary_species.uniform_resource_locator IS 'The associated Uniform Resource Locator.'
;
COMMENT ON COLUMN ancillary_species.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN ancillary_species.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN ancillary_species.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN ancillary_species.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN ancillary_species.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE ancillary_species IS 'The ancillary species the project is inventoring or monitoring.'
;

-- 
-- TABLE: audit_log 
--

CREATE TABLE audit_log(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id    integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    table_name        varchar(200)    NOT NULL,
    operation         varchar(20)     NOT NULL,
    before_value      json,
    after_value       json,
    CONSTRAINT pk103_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN audit_log.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN audit_log.system_user_id IS 'The system user id affecting the data change.'
;
COMMENT ON COLUMN audit_log.table_name IS 'The table name of the data record.'
;
COMMENT ON COLUMN audit_log.operation IS 'The operation that affected the data change (ie. INSERT, UPDATE, DELETE, TRUNCATE).'
;
COMMENT ON COLUMN audit_log.before_value IS 'The JSON representation of the before value of the record.'
;
COMMENT ON COLUMN audit_log.after_value IS 'The JSON representation of the after value of the record.'
;
COMMENT ON TABLE audit_log IS 'Holds record level audit log data for the entire database.'
;

-- 
-- TABLE: climate_change_initiative 
--

CREATE TABLE climate_change_initiative(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN climate_change_initiative.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN climate_change_initiative.name IS 'The name of the record.'
;
COMMENT ON COLUMN climate_change_initiative.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN climate_change_initiative.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN climate_change_initiative.description IS 'The description of the record.'
;
COMMENT ON COLUMN climate_change_initiative.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN climate_change_initiative.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN climate_change_initiative.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN climate_change_initiative.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN climate_change_initiative.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE climate_change_initiative IS 'Identifies the climate change initiative for the project.'
;

-- 
-- TABLE: first_nations 
--

CREATE TABLE first_nations(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_3 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN first_nations.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN first_nations.name IS 'Name of the First Nation.'
;
COMMENT ON COLUMN first_nations.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN first_nations.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN first_nations.description IS 'The description of the record.'
;
COMMENT ON COLUMN first_nations.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN first_nations.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN first_nations.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN first_nations.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN first_nations.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE first_nations IS 'A list of first nations.'
;

-- 
-- TABLE: focal_species 
--

CREATE TABLE focal_species(
    id                          integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                        varchar(300)     NOT NULL,
    p_id                        integer          NOT NULL,
    uniform_resource_locator    varchar(2000),
    create_date                 timestamp(6)     DEFAULT now() NOT NULL,
    create_user                 integer          NOT NULL,
    update_date                 timestamp(6),
    update_user                 integer,
    revision_count              integer          DEFAULT 0 NOT NULL,
    CONSTRAINT "PK122" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN focal_species.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN focal_species.name IS 'The name of the focal species.'
;
COMMENT ON COLUMN focal_species.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN focal_species.uniform_resource_locator IS 'The associated Uniform Resource Locator.'
;
COMMENT ON COLUMN focal_species.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN focal_species.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN focal_species.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN focal_species.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN focal_species.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE focal_species IS 'The focal species the project is inventoring or monitoring.'
;

-- 
-- TABLE: funding_source 
--

CREATE TABLE funding_source(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(100)    NOT NULL,
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    project_id_optional      character(1)    NOT NULL,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN funding_source.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN funding_source.name IS 'The name of the funding source.'
;
COMMENT ON COLUMN funding_source.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN funding_source.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN funding_source.description IS 'The description of the record.'
;
COMMENT ON COLUMN funding_source.project_id_optional IS 'Provides whether the project id for the identified funding source is optional. A value of "Y" provides that the project id is optional and a value of "N" provides that the project id is not optional.'
;
COMMENT ON COLUMN funding_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN funding_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN funding_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN funding_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN funding_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE funding_source IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: investment_action_category 
--

CREATE TABLE investment_action_category(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    fs_id                    integer         NOT NULL,
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT "PK83" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN investment_action_category.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN investment_action_category.fs_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN investment_action_category.name IS 'The name of the investment or action category.'
;
COMMENT ON COLUMN investment_action_category.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN investment_action_category.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN investment_action_category.description IS 'The description of the record.'
;
COMMENT ON COLUMN investment_action_category.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN investment_action_category.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN investment_action_category.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN investment_action_category.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN investment_action_category.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE investment_action_category IS 'The investment or action categories associated with the funding source. Funding sources may have no investment or action category thus the default category of Not Applicable is used.'
;

-- 
-- TABLE: iucn_conservation_action_level_1_classification 
--

CREATE TABLE iucn_conservation_action_level_1_classification(
    id                       integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date             NOT NULL,
    description              varchar(3000),
    create_date              timestamp(6)     DEFAULT now() NOT NULL,
    create_user              integer          NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer          DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_4 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_1_classification.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.name IS 'The name of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.description IS 'The description of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE iucn_conservation_action_level_1_classification IS 'List of IUCN conservation level 1 action classifications.'
;

-- 
-- TABLE: iucn_conservation_action_level_2_subclassification 
--

CREATE TABLE iucn_conservation_action_level_2_subclassification(
    id                       integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn_id                  integer          NOT NULL,
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date             NOT NULL,
    description              varchar(3000),
    create_date              timestamp(6)     DEFAULT now() NOT NULL,
    create_user              integer          NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer          DEFAULT 0 NOT NULL,
    CONSTRAINT pk83_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.iucn_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.name IS 'The name of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.description IS 'The description of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE iucn_conservation_action_level_2_subclassification IS 'List of IUCN conservation action level 2 subclassifications.'
;

-- 
-- TABLE: iucn_conservation_action_level_3_subclassification 
--

CREATE TABLE iucn_conservation_action_level_3_subclassification(
    id                       integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn1_id                 integer          NOT NULL,
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date             NOT NULL,
    description              varchar(3000),
    create_date              timestamp(6)     DEFAULT now() NOT NULL,
    create_user              integer          NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer          DEFAULT 0 NOT NULL,
    CONSTRAINT pk83_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.iucn1_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.name IS 'The name of the IUCN action classification sublevel 2.
'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.description IS 'The description of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE iucn_conservation_action_level_3_subclassification IS 'List of IUCN conservation action level 3 subclassifications.'
;

-- 
-- TABLE: management_action_type 
--

CREATE TABLE management_action_type(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN management_action_type.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN management_action_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN management_action_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN management_action_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN management_action_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN management_action_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN management_action_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN management_action_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN management_action_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN management_action_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE management_action_type IS 'List of Management Actions.'
;

-- 
-- TABLE: no_sample_permit 
--

CREATE TABLE no_sample_permit(
    id                           integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    number                       varchar(100)    NOT NULL,
    issue_date                   date,
    end_date                     date,
    coordinator_first_name       varchar(50)     NOT NULL,
    coordinator_last_name        varchar(50)     NOT NULL,
    coordinator_email_address    varchar(500)    NOT NULL,
    coordinator_agency_name      varchar(300)    NOT NULL,
    create_date                  timestamp(6)    DEFAULT now() NOT NULL,
    create_user                  integer         NOT NULL,
    update_date                  timestamp(6),
    update_user                  integer,
    revision_count               integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_2_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN no_sample_permit.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN no_sample_permit.number IS 'Permit number provided by FrontCounter BC.'
;
COMMENT ON COLUMN no_sample_permit.issue_date IS 'The date the permit was issued.'
;
COMMENT ON COLUMN no_sample_permit.end_date IS 'The date the permit is no longer valid.'
;
COMMENT ON COLUMN no_sample_permit.coordinator_first_name IS 'The first name of the permit coordinator.'
;
COMMENT ON COLUMN no_sample_permit.coordinator_last_name IS 'The last name of the permit coordinator.
'
;
COMMENT ON COLUMN no_sample_permit.coordinator_email_address IS 'The email address.'
;
COMMENT ON COLUMN no_sample_permit.coordinator_agency_name IS 'The permit coordinator agency name.'
;
COMMENT ON COLUMN no_sample_permit.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN no_sample_permit.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN no_sample_permit.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN no_sample_permit.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN no_sample_permit.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE no_sample_permit IS 'Provides a record of scientific permits for which no sampling was conducted.'
;

-- 
-- TABLE: project 
--

CREATE TABLE project(
    id                            integer                    GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    pt_id                         integer                    NOT NULL,
    name                          varchar(50)                NOT NULL,
    objectives                    varchar(3000)              NOT NULL,
    management_recovery_action    character(1),
    location_description          varchar(3000),
    start_date                    date                       NOT NULL,
    end_date                      date,
    caveats                       varchar(3000),
    comments                      varchar(3000),
    coordinator_first_name        varchar(50)                NOT NULL,
    coordinator_last_name         varchar(50)                NOT NULL,
    coordinator_email_address     varchar(500)               NOT NULL,
    coordinator_agency_name       varchar(300)               NOT NULL,
    coordinator_public            character(1)               NOT NULL,
    geometry                      geometry(polygon, 3005),
    geography                     geography(geometry),
    create_date                   timestamp(6)               DEFAULT now() NOT NULL,
    create_user                   integer                    NOT NULL,
    update_date                   timestamp(6),
    update_user                   integer,
    revision_count                integer                    DEFAULT 0 NOT NULL,
    CONSTRAINT "PK45" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.pt_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.name IS 'Name given to a project'
;
COMMENT ON COLUMN project.objectives IS 'The objectives for the project. What questions is this project trying to answer?'
;
COMMENT ON COLUMN project.management_recovery_action IS 'Identifies if the project addresses a management or recovery action.'
;
COMMENT ON COLUMN project.location_description IS 'The location description.'
;
COMMENT ON COLUMN project.start_date IS 'The record start date.'
;
COMMENT ON COLUMN project.caveats IS 'Important stipulations, conditions, or limitations to the project results.'
;
COMMENT ON COLUMN project.comments IS 'Comments about the project.'
;
COMMENT ON COLUMN project.coordinator_first_name IS 'The first name of the person directly responsible for the project.'
;
COMMENT ON COLUMN project.coordinator_last_name IS 'The last name of the person directly responsible for the project.'
;
COMMENT ON COLUMN project.coordinator_email_address IS 'The coordinators email address.'
;
COMMENT ON COLUMN project.coordinator_agency_name IS 'Name of agency the project coordinator works for.'
;
COMMENT ON COLUMN project.coordinator_public IS 'A flag that determines whether personal coordinator details are public. A value of "Y" provides that personal details are public.'
;
COMMENT ON COLUMN project.geometry IS 'The containing geometry of the record.'
;
COMMENT ON COLUMN project.geography IS 'The containing geography of the record.'
;
COMMENT ON COLUMN project.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project IS 'The top level organizational structure for data collection. '
;

-- 
-- TABLE: project_activity 
--

CREATE TABLE project_activity(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer         NOT NULL,
    a_id              integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_3_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_activity.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_activity.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_activity.a_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_activity.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_activity.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_activity.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_activity.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_activity.revision_count IS 'Revision count used for concurrency control.'
;

-- 
-- TABLE: project_climate_initiative 
--

CREATE TABLE project_climate_initiative(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    cci_id            integer         NOT NULL,
    p_id              integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_3 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_climate_initiative.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_climate_initiative.cci_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_climate_initiative.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_climate_initiative.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_climate_initiative.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_climate_initiative.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_climate_initiative.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_climate_initiative.revision_count IS 'Revision count used for concurrency control.'
;

-- 
-- TABLE: project_first_nation 
--

CREATE TABLE project_first_nation(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer         NOT NULL,
    fn_id             integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_3_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_first_nation.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.fn_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_first_nation.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_first_nation.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_first_nation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_first_nation.revision_count IS 'Revision count used for concurrency control.'
;

-- 
-- TABLE: project_funding_source 
--

CREATE TABLE project_funding_source(
    id                           integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id                         integer         NOT NULL,
    iac_id                       integer         NOT NULL,
    funding_source_project_id    varchar(50),
    funding_amount               money           NOT NULL,
    funding_start_date           date            NOT NULL,
    funding_end_date             date            NOT NULL,
    create_date                  timestamp(6)    DEFAULT now() NOT NULL,
    create_user                  integer         NOT NULL,
    update_date                  timestamp(6),
    update_user                  integer,
    revision_count               integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_funding_source.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.iac_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.funding_source_project_id IS 'Idenfification number used by funding source to reference the project'
;
COMMENT ON COLUMN project_funding_source.funding_amount IS 'Funding amount from funding source.'
;
COMMENT ON COLUMN project_funding_source.funding_start_date IS 'Start date for funding from the source.'
;
COMMENT ON COLUMN project_funding_source.funding_end_date IS 'End date for funding from the source.'
;
COMMENT ON COLUMN project_funding_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_funding_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_funding_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_funding_source IS 'Project funding source details.'
;

-- 
-- TABLE: project_iucn_action_classificaton 
--

CREATE TABLE project_iucn_action_classificaton(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn2_id          integer         NOT NULL,
    p_id              integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_1_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_iucn_action_classificaton.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.iucn2_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_iucn_action_classificaton.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_iucn_action_classificaton IS 'Project IUCN classifications.'
;

-- 
-- TABLE: project_management_actions 
--

CREATE TABLE project_management_actions(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    mat_id            integer         NOT NULL,
    p_id              integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_4 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_management_actions.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_management_actions.mat_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_management_actions.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_management_actions.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_management_actions.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_management_actions.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_management_actions.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_management_actions.revision_count IS 'Revision count used for concurrency control.'
;

-- 
-- TABLE: project_participation 
--

CREATE TABLE project_participation(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer         NOT NULL,
    su_id             integer         NOT NULL,
    pr_id             integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_participation.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.su_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.pr_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_participation.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_participation.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_participation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_participation.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_participation IS 'A history of the project user participation for the project.'
;

-- 
-- TABLE: project_permit 
--

CREATE TABLE project_permit(
    id                    integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id                  integer         NOT NULL,
    number                varchar(100)    NOT NULL,
    sampling_conducted    character(1)    NOT NULL,
    issue_date            date,
    end_date              date,
    create_date           timestamp(6)    DEFAULT now() NOT NULL,
    create_user           integer         NOT NULL,
    update_date           timestamp(6),
    update_user           integer,
    revision_count        integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_2_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_permit.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_permit.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_permit.number IS 'Permit number provided by FrontCounter BC.'
;
COMMENT ON COLUMN project_permit.sampling_conducted IS 'Yes/No value defining whether sampling was conducted associated with the permit.'
;
COMMENT ON COLUMN project_permit.issue_date IS 'The date the permit was issued.'
;
COMMENT ON COLUMN project_permit.end_date IS 'The date the permit is no longer valid.'
;
COMMENT ON COLUMN project_permit.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_permit.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_permit.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_permit.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_permit.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_permit IS 'The scientific permits associated with a project.'
;

-- 
-- TABLE: project_region 
--

CREATE TABLE project_region(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer         NOT NULL,
    name              varchar(200)    NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT "PK55" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_region.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_region.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_region.name IS 'The region name.'
;
COMMENT ON COLUMN project_region.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_region.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_region.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_region.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_region.revision_count IS 'Revision count used for concurrency control.'
;

-- 
-- TABLE: project_role 
--

CREATE TABLE project_role(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    record_effective_date    date            NOT NULL,
    description              varchar(250)    NOT NULL,
    record_end_date          date,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_3 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_role.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_role.name IS 'The name of the project role.'
;
COMMENT ON COLUMN project_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_role.description IS 'The description of the project role.'
;
COMMENT ON COLUMN project_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_role IS 'Project participation roles.'
;

-- 
-- TABLE: project_type 
--

CREATE TABLE project_type(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    record_effective_date    date            NOT NULL,
    description              varchar(250),
    record_end_date          date,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_3_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_type.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_type.name IS 'The name of the project role.'
;
COMMENT ON COLUMN project_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_type.description IS 'The description of the project type.'
;
COMMENT ON COLUMN project_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_type IS 'Broad classification for the project.'
;

-- 
-- TABLE: stakeholder_partnership 
--

CREATE TABLE stakeholder_partnership(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name              varchar(300),
    p_id              integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN stakeholder_partnership.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN stakeholder_partnership.name IS 'The name of the stakeholder.'
;
COMMENT ON COLUMN stakeholder_partnership.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN stakeholder_partnership.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN stakeholder_partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN stakeholder_partnership.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN stakeholder_partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN stakeholder_partnership.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE stakeholder_partnership IS 'Stakeholder partnerships associated with the project.'
;

-- 
-- TABLE: system_role 
--

CREATE TABLE system_role(
    id                       integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)      NOT NULL,
    record_effective_date    date             NOT NULL,
    record_end_date          date,
    description              varchar(250)     NOT NULL,
    notes                    varchar(3000),
    create_date              timestamp(6)     DEFAULT now() NOT NULL,
    create_user              integer          NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer          DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN system_role.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_role.name IS 'The name of the record.'
;
COMMENT ON COLUMN system_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN system_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN system_role.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_role IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: system_user 
--

CREATE TABLE system_user(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    uis_id                   integer         NOT NULL,
    user_identifier          varchar(200)    NOT NULL,
    record_effective_date    date            NOT NULL,
    record_end_date          date,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN system_user.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user.uis_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user.user_identifier IS 'The identifier of the user.'
;
COMMENT ON COLUMN system_user.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN system_user.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN system_user.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_user.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_user.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_user IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: system_user_role 
--

CREATE TABLE system_user_role(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    su_id             integer         NOT NULL,
    sr_id             integer         NOT NULL,
    create_date       timestamp(6)    DEFAULT now() NOT NULL,
    create_user       integer         NOT NULL,
    update_date       timestamp(6),
    update_user       integer,
    revision_count    integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN system_user_role.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.su_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.sr_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_user_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_user_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user_role.revision_count IS 'Revision count used for concurrency control.'
;

-- 
-- TABLE: user_identity_source 
--

CREATE TABLE user_identity_source(
    id                       integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)      NOT NULL,
    record_effective_date    date             NOT NULL,
    record_end_date          date,
    description              varchar(250),
    notes                    varchar(3000),
    create_date              timestamp(6)     DEFAULT now() NOT NULL,
    create_user              integer          NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer          DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_2_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN user_identity_source.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN user_identity_source.name IS 'The name of the record.'
;
COMMENT ON COLUMN user_identity_source.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN user_identity_source.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN user_identity_source.description IS 'The description of the record.'
;
COMMENT ON COLUMN user_identity_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN user_identity_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN user_identity_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN user_identity_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN user_identity_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE user_identity_source IS 'The source of the user identifier. Example sources could include IDIR, BCEID and DATABASE.'
;

-- 
-- INDEX: a_nuk1 
--

CREATE UNIQUE INDEX a_nuk1 ON activity(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: as_uk1 
--

CREATE UNIQUE INDEX as_uk1 ON ancillary_species(name, p_id)
;
-- 
-- INDEX: "Ref4544" 
--

CREATE INDEX "Ref4544" ON ancillary_species(p_id)
;
-- 
-- INDEX: cci_nuk1 
--

CREATE UNIQUE INDEX cci_nuk1 ON climate_change_initiative(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: cci_nuk1_1 
--

CREATE UNIQUE INDEX cci_nuk1_1 ON first_nations(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: fs_uk1 
--

CREATE UNIQUE INDEX fs_uk1 ON focal_species(name, p_id)
;
-- 
-- INDEX: "Ref4543" 
--

CREATE INDEX "Ref4543" ON focal_species(p_id)
;
-- 
-- INDEX: fs_nuk2 
--

CREATE UNIQUE INDEX fs_nuk2 ON funding_source(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: iac_nuk1 
--

CREATE UNIQUE INDEX iac_nuk1 ON investment_action_category(fs_id, name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: "Ref7345" 
--

CREATE INDEX "Ref7345" ON investment_action_category(fs_id)
;
-- 
-- INDEX: iucn_nuk1 
--

CREATE UNIQUE INDEX iucn_nuk1 ON iucn_conservation_action_level_1_classification(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: iac1_nuk1 
--

CREATE UNIQUE INDEX iac1_nuk1 ON iucn_conservation_action_level_2_subclassification(iucn_id, name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: "Ref13764" 
--

CREATE INDEX "Ref13764" ON iucn_conservation_action_level_2_subclassification(iucn_id)
;
-- 
-- INDEX: iac2_nuk1 
--

CREATE UNIQUE INDEX iac2_nuk1 ON iucn_conservation_action_level_3_subclassification(iucn1_id, name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: "Ref13965" 
--

CREATE INDEX "Ref13965" ON iucn_conservation_action_level_3_subclassification(iucn1_id)
;
-- 
-- INDEX: mat_nuk1 
--

CREATE UNIQUE INDEX mat_nuk1 ON management_action_type(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: nsp_uk1 
--

CREATE UNIQUE INDEX nsp_uk1 ON no_sample_permit(number)
;
-- 
-- INDEX: "Ref12852" 
--

CREATE INDEX "Ref12852" ON project(pt_id)
;
-- 
-- INDEX: pa_uk1 
--

CREATE UNIQUE INDEX pa_uk1 ON project_activity(p_id, a_id)
;
-- 
-- INDEX: "Ref4556" 
--

CREATE INDEX "Ref4556" ON project_activity(p_id)
;
-- 
-- INDEX: "Ref13658" 
--

CREATE INDEX "Ref13658" ON project_activity(a_id)
;
-- 
-- INDEX: pci_uk1 
--

CREATE UNIQUE INDEX pci_uk1 ON project_climate_initiative(cci_id, p_id)
;
-- 
-- INDEX: "Ref9536" 
--

CREATE INDEX "Ref9536" ON project_climate_initiative(cci_id)
;
-- 
-- INDEX: "Ref4537" 
--

CREATE INDEX "Ref4537" ON project_climate_initiative(p_id)
;
-- 
-- INDEX: pfn_uk1 
--

CREATE UNIQUE INDEX pfn_uk1 ON project_first_nation(p_id, fn_id)
;
-- 
-- INDEX: "Ref4549" 
--

CREATE INDEX "Ref4549" ON project_first_nation(p_id)
;
-- 
-- INDEX: "Ref12750" 
--

CREATE INDEX "Ref12750" ON project_first_nation(fn_id)
;
-- 
-- INDEX: pfs_uk1 
--

CREATE UNIQUE INDEX pfs_uk1 ON project_funding_source(p_id, funding_source_project_id, iac_id)
;
-- 
-- INDEX: "Ref4520" 
--

CREATE INDEX "Ref4520" ON project_funding_source(p_id)
;
-- 
-- INDEX: "Ref8351" 
--

CREATE INDEX "Ref8351" ON project_funding_source(iac_id)
;
-- 
-- INDEX: piac_uk1 
--

CREATE UNIQUE INDEX piac_uk1 ON project_iucn_action_classificaton(iucn2_id, p_id)
;
-- 
-- INDEX: "Ref14066" 
--

CREATE INDEX "Ref14066" ON project_iucn_action_classificaton(iucn2_id)
;
-- 
-- INDEX: "Ref4567" 
--

CREATE INDEX "Ref4567" ON project_iucn_action_classificaton(p_id)
;
-- 
-- INDEX: pma_uk1 
--

CREATE UNIQUE INDEX pma_uk1 ON project_management_actions(mat_id, p_id)
;
-- 
-- INDEX: "Ref9732" 
--

CREATE INDEX "Ref9732" ON project_management_actions(mat_id)
;
-- 
-- INDEX: "Ref4533" 
--

CREATE INDEX "Ref4533" ON project_management_actions(p_id)
;
-- 
-- INDEX: pp_uk1 
--

CREATE UNIQUE INDEX pp_uk1 ON project_participation(p_id, su_id, pr_id)
;
-- 
-- INDEX: "Ref4528" 
--

CREATE INDEX "Ref4528" ON project_participation(p_id)
;
-- 
-- INDEX: "Ref7829" 
--

CREATE INDEX "Ref7829" ON project_participation(su_id)
;
-- 
-- INDEX: "Ref10034" 
--

CREATE INDEX "Ref10034" ON project_participation(pr_id)
;
-- 
-- INDEX: prp_uk1 
--

CREATE UNIQUE INDEX prp_uk1 ON project_permit(number)
;
-- 
-- INDEX: "Ref4553" 
--

CREATE INDEX "Ref4553" ON project_permit(p_id)
;
-- 
-- INDEX: prr_uk1 
--

CREATE UNIQUE INDEX prr_uk1 ON project_region(p_id, name)
;
-- 
-- INDEX: "Ref4524" 
--

CREATE INDEX "Ref4524" ON project_region(p_id)
;
-- 
-- INDEX: pr_nuk1 
--

CREATE UNIQUE INDEX pr_nuk1 ON project_role(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: pt_nuk1 
--

CREATE UNIQUE INDEX pt_nuk1 ON project_type(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: sp_uk1 
--

CREATE UNIQUE INDEX sp_uk1 ON stakeholder_partnership(name, p_id)
;
-- 
-- INDEX: "Ref4539" 
--

CREATE INDEX "Ref4539" ON stakeholder_partnership(p_id)
;
-- 
-- INDEX: sr_nuk1 
--

CREATE UNIQUE INDEX sr_nuk1 ON system_role(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: su_nuk1 
--

CREATE UNIQUE INDEX su_nuk1 ON system_user(user_identifier, uis_id, (record_end_date is null)) where record_end_date is null
;
-- 
-- INDEX: "Ref12041" 
--

CREATE INDEX "Ref12041" ON system_user(uis_id)
;
-- 
-- INDEX: sur_uk1 
--

CREATE UNIQUE INDEX sur_uk1 ON system_user_role(su_id, sr_id)
;
-- 
-- INDEX: "Ref7821" 
--

CREATE INDEX "Ref7821" ON system_user_role(su_id)
;
-- 
-- INDEX: "Ref7922" 
--

CREATE INDEX "Ref7922" ON system_user_role(sr_id)
;
-- 
-- INDEX: uis_nuk1 
--

CREATE UNIQUE INDEX uis_nuk1 ON user_identity_source(name, (record_end_date is null)) where record_end_date is null
;
-- 
-- TABLE: ancillary_species 
--

ALTER TABLE ancillary_species ADD CONSTRAINT "Refproject44" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: focal_species 
--

ALTER TABLE focal_species ADD CONSTRAINT "Refproject43" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: investment_action_category 
--

ALTER TABLE investment_action_category ADD CONSTRAINT "Reffunding_source45" 
    FOREIGN KEY (fs_id)
    REFERENCES funding_source(id)
;


-- 
-- TABLE: iucn_conservation_action_level_2_subclassification 
--

ALTER TABLE iucn_conservation_action_level_2_subclassification ADD CONSTRAINT "Refiucn_conservation_action_level_1_classification64" 
    FOREIGN KEY (iucn_id)
    REFERENCES iucn_conservation_action_level_1_classification(id)
;


-- 
-- TABLE: iucn_conservation_action_level_3_subclassification 
--

ALTER TABLE iucn_conservation_action_level_3_subclassification ADD CONSTRAINT "Refiucn_conservation_action_level_2_subclassification65" 
    FOREIGN KEY (iucn1_id)
    REFERENCES iucn_conservation_action_level_2_subclassification(id)
;


-- 
-- TABLE: project 
--

ALTER TABLE project ADD CONSTRAINT "Refproject_type52" 
    FOREIGN KEY (pt_id)
    REFERENCES project_type(id)
;


-- 
-- TABLE: project_activity 
--

ALTER TABLE project_activity ADD CONSTRAINT "Refproject56" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;

ALTER TABLE project_activity ADD CONSTRAINT "Refactivity58" 
    FOREIGN KEY (a_id)
    REFERENCES activity(id)
;


-- 
-- TABLE: project_climate_initiative 
--

ALTER TABLE project_climate_initiative ADD CONSTRAINT "Refclimate_change_initiative36" 
    FOREIGN KEY (cci_id)
    REFERENCES climate_change_initiative(id)
;

ALTER TABLE project_climate_initiative ADD CONSTRAINT "Refproject37" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: project_first_nation 
--

ALTER TABLE project_first_nation ADD CONSTRAINT "Refproject49" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;

ALTER TABLE project_first_nation ADD CONSTRAINT "Reffirst_nations50" 
    FOREIGN KEY (fn_id)
    REFERENCES first_nations(id)
;


-- 
-- TABLE: project_funding_source 
--

ALTER TABLE project_funding_source ADD CONSTRAINT "Refproject20" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;

ALTER TABLE project_funding_source ADD CONSTRAINT "Refinvestment_action_category51" 
    FOREIGN KEY (iac_id)
    REFERENCES investment_action_category(id)
;


-- 
-- TABLE: project_iucn_action_classificaton 
--

ALTER TABLE project_iucn_action_classificaton ADD CONSTRAINT "Refiucn_conservation_action_level_3_subclassification66" 
    FOREIGN KEY (iucn2_id)
    REFERENCES iucn_conservation_action_level_3_subclassification(id)
;

ALTER TABLE project_iucn_action_classificaton ADD CONSTRAINT "Refproject67" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: project_management_actions 
--

ALTER TABLE project_management_actions ADD CONSTRAINT "Refmanagement_action_type32" 
    FOREIGN KEY (mat_id)
    REFERENCES management_action_type(id)
;

ALTER TABLE project_management_actions ADD CONSTRAINT "Refproject33" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: project_participation 
--

ALTER TABLE project_participation ADD CONSTRAINT "Refproject28" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;

ALTER TABLE project_participation ADD CONSTRAINT "Refsystem_user29" 
    FOREIGN KEY (su_id)
    REFERENCES system_user(id)
;

ALTER TABLE project_participation ADD CONSTRAINT "Refproject_role34" 
    FOREIGN KEY (pr_id)
    REFERENCES project_role(id)
;


-- 
-- TABLE: project_permit 
--

ALTER TABLE project_permit ADD CONSTRAINT "Refproject53" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: project_region 
--

ALTER TABLE project_region ADD CONSTRAINT "Refproject24" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: stakeholder_partnership 
--

ALTER TABLE stakeholder_partnership ADD CONSTRAINT "Refproject39" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: system_user 
--

ALTER TABLE system_user ADD CONSTRAINT "Refuser_identity_source41" 
    FOREIGN KEY (uis_id)
    REFERENCES user_identity_source(id)
;


-- 
-- TABLE: system_user_role 
--

ALTER TABLE system_user_role ADD CONSTRAINT "Refsystem_user21" 
    FOREIGN KEY (su_id)
    REFERENCES system_user(id)
;

ALTER TABLE system_user_role ADD CONSTRAINT "Refsystem_role22" 
    FOREIGN KEY (sr_id)
    REFERENCES system_role(id)
;


