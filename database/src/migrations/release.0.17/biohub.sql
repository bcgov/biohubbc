--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      BioHub.DM1
--
-- Date Created : Thursday, June 03, 2021 12:01:34
-- Target DBMS : PostgreSQL 10.x-12.x
--

-- 
-- TABLE: activity 
--

CREATE TABLE activity(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
-- TABLE: administrative_activity 
--

CREATE TABLE administrative_activity(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    aat_id            integer           NOT NULL,
    reported_su_id    integer           NOT NULL,
    aast_id           integer           NOT NULL,
    assigned_su_id    integer,
    description       varchar(3000),
    data              json,
    notes             varchar(3000),
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK144" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN administrative_activity.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.aat_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.reported_su_id IS 'The system user id who reported the administrative activity.'
;
COMMENT ON COLUMN administrative_activity.aast_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.assigned_su_id IS 'The system user id assigned to the administrative activity.
'
;
COMMENT ON COLUMN administrative_activity.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN administrative_activity.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN administrative_activity.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity IS 'Administrative activity is a list of activities to be performed in order to maintain the business processes of the system.'
;

-- 
-- TABLE: administrative_activity_status_type 
--

CREATE TABLE administrative_activity_status_type(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_4_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN administrative_activity_status_type.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity_status_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN administrative_activity_status_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN administrative_activity_status_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN administrative_activity_status_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity_status_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity_status_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_status_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity_status_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_status_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity_status_type IS 'Administrative activity status type describes a class of statuses that describe the state of an administrative activity record.'
;

-- 
-- TABLE: administrative_activity_type 
--

CREATE TABLE administrative_activity_type(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_4 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN administrative_activity_type.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN administrative_activity_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN administrative_activity_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN administrative_activity_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity_type IS 'Administrative activity type describes a class of administrative activities that is performed in order to maintain the business processes of the application.'
;

-- 
-- TABLE: audit_log 
--

CREATE TABLE audit_log(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id    integer         NOT NULL,
    create_date       TIMESTAMPTZ     DEFAULT now() NOT NULL,
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
COMMENT ON COLUMN audit_log.create_date IS 'The date and time of record creation.'
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300)      NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_3 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN first_nations.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN first_nations.name IS 'Name of the First Nation.'
;
COMMENT ON COLUMN first_nations.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN first_nations.record_end_date IS 'Record level end date.'
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
-- TABLE: funding_source 
--

CREATE TABLE funding_source(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(100)      NOT NULL,
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    project_id_optional      boolean           NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    fs_id                    integer           NOT NULL,
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn1_id                 integer           NOT NULL,
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk83_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.iucn1_id IS 'System generated surrogate primary key identifier.'
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn2_id                 integer           NOT NULL,
    name                     varchar(300),
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk83_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.iucn2_id IS 'System generated surrogate primary key identifier.'
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
-- TABLE: permit 
--

CREATE TABLE permit(
    id                           integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id                         integer,
    s_id                         integer,
    number                       varchar(100)      NOT NULL,
    type                         varchar(300)      NOT NULL,
    coordinator_first_name       varchar(50),
    coordinator_last_name        varchar(50),
    coordinator_email_address    varchar(500),
    coordinator_agency_name      varchar(300),
    issue_date                   date,
    end_date                     date,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_2_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN permit.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.number IS 'Permit number provided by FrontCounter BC.'
;
COMMENT ON COLUMN permit.type IS 'The tye of the permit.'
;
COMMENT ON COLUMN permit.coordinator_first_name IS 'The first name of the permit coordinator.'
;
COMMENT ON COLUMN permit.coordinator_last_name IS 'The last name of the permit coordinator.
'
;
COMMENT ON COLUMN permit.coordinator_email_address IS 'The email address.'
;
COMMENT ON COLUMN permit.coordinator_agency_name IS 'The permit coordinator agency name.'
;
COMMENT ON COLUMN permit.issue_date IS 'The date the permit was issued.'
;
COMMENT ON COLUMN permit.end_date IS 'The date the permit is no longer valid.'
;
COMMENT ON COLUMN permit.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN permit.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN permit.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN permit.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN permit.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE permit IS 'Provides a record of scientific permits. Note that permits are first class objects in the data model and do not require an association to either a project or survey. Additionally:
- Association to a survey or project implies that sampling was conducted related to the permit 
- No association to a survey or project implies that sampling was not conducted related to the permit
- Permits that are associated with a project should eventually be related to a survey
- Permits can be associated with one or zero projects
- Permits can only be associated with one survey
- Permits that have no association with a project or survey require values for coordinator first name, last name, email address and agency name

NOTE: there are conceptual problems with associating permits to projects early instead of at the survey level and these should be addressed in subsequent versions of the application.'
;

-- 
-- TABLE: project 
--

CREATE TABLE project(
    id                            integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    pt_id                         integer                     NOT NULL,
    name                          varchar(50)                 NOT NULL,
    objectives                    varchar(3000)               NOT NULL,
    management_recovery_action    character(1),
    location_description          varchar(3000),
    start_date                    date                        NOT NULL,
    end_date                      date,
    caveats                       varchar(3000),
    comments                      varchar(3000),
    coordinator_first_name        varchar(50)                 NOT NULL,
    coordinator_last_name         varchar(50)                 NOT NULL,
    coordinator_email_address     varchar(500)                NOT NULL,
    coordinator_agency_name       varchar(300)                NOT NULL,
    coordinator_public            boolean                     NOT NULL,
    geometry                      geometry(geometry, 3005),
    geography                     geography(geometry),
    create_date                   timestamptz(6)              DEFAULT now() NOT NULL,
    create_user                   integer                     NOT NULL,
    update_date                   timestamptz(6),
    update_user                   integer,
    revision_count                integer                     DEFAULT 0 NOT NULL,
    CONSTRAINT "PK45" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.pt_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.name IS 'Name given to a project.'
;
COMMENT ON COLUMN project.objectives IS 'The objectives for the project.'
;
COMMENT ON COLUMN project.management_recovery_action IS 'Identifies if the project addresses a management or recovery action.'
;
COMMENT ON COLUMN project.location_description IS 'The location description.'
;
COMMENT ON COLUMN project.start_date IS 'The start date of the project.'
;
COMMENT ON COLUMN project.end_date IS 'The end date of the project.'
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
COMMENT ON TABLE project IS 'The top level organizational structure for project data collection. '
;

-- 
-- TABLE: project_activity 
--

CREATE TABLE project_activity(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer           NOT NULL,
    a_id              integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_activity IS 'A associative entity that joins projects and project activity types.'
;

-- 
-- TABLE: project_attachment 
--

CREATE TABLE project_attachment(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer           NOT NULL,
    file_name         varchar(300),
    title             varchar(300),
    description       varchar(250),
    key               varchar(1000)     NOT NULL,
    file_size         integer,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK141" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_attachment.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_attachment.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_attachment.file_name IS 'The name of the file attachment.'
;
COMMENT ON COLUMN project_attachment.title IS 'The title of the file.'
;
COMMENT ON COLUMN project_attachment.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_attachment.key IS 'The identifying key to the file in the storage system.'
;
COMMENT ON COLUMN project_attachment.file_size IS 'The size of the file in bytes.'
;
COMMENT ON COLUMN project_attachment.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_attachment.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_attachment.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_attachment.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_attachment.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_attachment IS 'A list of project attachments.'
;

-- 
-- TABLE: project_climate_initiative 
--

CREATE TABLE project_climate_initiative(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    cci_id            integer           NOT NULL,
    p_id              integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_climate_initiative IS 'A associative entity that joins that joins projects and climate change initiative types.'
;

-- 
-- TABLE: project_first_nation 
--

CREATE TABLE project_first_nation(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer           NOT NULL,
    fn_id             integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_first_nation IS 'A associative entity that joins projects and first nations.'
;

-- 
-- TABLE: project_funding_source 
--

CREATE TABLE project_funding_source(
    id                           integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id                         integer           NOT NULL,
    iac_id                       integer           NOT NULL,
    funding_source_project_id    varchar(50),
    funding_amount               money             NOT NULL,
    funding_start_date           date              NOT NULL,
    funding_end_date             date              NOT NULL,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_funding_source IS 'A associative entity that joins projects and funding source details.'
;

-- 
-- TABLE: project_iucn_action_classification 
--

CREATE TABLE project_iucn_action_classification(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer           NOT NULL,
    iucn3_id          integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk55_1_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_iucn_action_classification.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classification.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classification.iucn3_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_iucn_action_classification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_iucn_action_classification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_iucn_action_classification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_iucn_action_classification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_iucn_action_classification IS 'An associative entity that links projects and IUCN classifications.'
;

-- 
-- TABLE: project_management_actions 
--

CREATE TABLE project_management_actions(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    mat_id            integer           NOT NULL,
    p_id              integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_management_actions IS 'A associative entity that joins projects and management action types.'
;

-- 
-- TABLE: project_participation 
--

CREATE TABLE project_participation(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer           NOT NULL,
    su_id             integer           NOT NULL,
    pr_id             integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_participation IS 'A associative entity that joins projects, system users and project role types.'
;

-- 
-- TABLE: project_region 
--

CREATE TABLE project_region(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer           NOT NULL,
    name              varchar(200)      NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE project_region IS 'The region of a project.'
;

-- 
-- TABLE: project_role 
--

CREATE TABLE project_role(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250)      NOT NULL,
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_3 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project_role.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_role.name IS 'The name of the project role.'
;
COMMENT ON COLUMN project_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_role.description IS 'The description of the project role.'
;
COMMENT ON COLUMN project_role.notes IS 'Notes associated with the record.'
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
-- TABLE: proprietor_type 
--

CREATE TABLE proprietor_type(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250),
    is_first_nation          boolean           NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_3_1_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN proprietor_type.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN proprietor_type.name IS 'The name of the proprietary type.'
;
COMMENT ON COLUMN proprietor_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN proprietor_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN proprietor_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN proprietor_type.is_first_nation IS 'Defines whether the type is first nations related and thus requires child records to be associated with a first nations name reference.'
;
COMMENT ON COLUMN proprietor_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN proprietor_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN proprietor_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN proprietor_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN proprietor_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE proprietor_type IS 'Identifies the available reasons that subject data can be proprietary.'
;

-- 
-- TABLE: stakeholder_partnership 
--

CREATE TABLE stakeholder_partnership(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name              varchar(300),
    p_id              integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
-- TABLE: study_species 
--

CREATE TABLE study_species(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    s_id              integer,
    wu_id             integer           NOT NULL,
    is_focal          boolean           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk122_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN study_species.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN study_species.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN study_species.wu_id IS 'System generated UID for a taxon.'
;
COMMENT ON COLUMN study_species.is_focal IS 'Define whether the species association is focal or not. A true value defines the association as focal.'
;
COMMENT ON COLUMN study_species.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN study_species.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN study_species.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN study_species.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN study_species.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE study_species IS 'The study species for the survey.'
;

-- 
-- TABLE: survey 
--

CREATE TABLE survey(
    id                      integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id                    integer                     NOT NULL,
    name                    varchar(300),
    objectives              varchar(3000)               NOT NULL,
    start_date              date                        NOT NULL,
    lead_first_name         varchar(50)                 NOT NULL,
    lead_last_name          varchar(50)                 NOT NULL,
    end_date                date,
    location_description    varchar(3000),
    location_name           varchar(300)                NOT NULL,
    geometry                geometry(geometry, 3005),
    geography               geography(geometry),
    create_date             timestamptz(6)              DEFAULT now() NOT NULL,
    create_user             integer                     NOT NULL,
    update_date             timestamptz(6),
    update_user             integer,
    revision_count          integer                     DEFAULT 0 NOT NULL,
    CONSTRAINT pk45_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN survey.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey.name IS 'Name given to a survey.'
;
COMMENT ON COLUMN survey.objectives IS 'The objectives for the survey.'
;
COMMENT ON COLUMN survey.start_date IS 'The start date of the survey.
'
;
COMMENT ON COLUMN survey.lead_first_name IS 'The first name of the person who is the lead for the survey.'
;
COMMENT ON COLUMN survey.lead_last_name IS 'The last name of the person who is the lead for the survey.'
;
COMMENT ON COLUMN survey.end_date IS 'The end date of the survey.'
;
COMMENT ON COLUMN survey.location_description IS 'The location description.'
;
COMMENT ON COLUMN survey.location_name IS 'The name of the survey location.'
;
COMMENT ON COLUMN survey.geometry IS 'The containing geometry of the record.'
;
COMMENT ON COLUMN survey.geography IS 'The containing geography of the record.'
;
COMMENT ON COLUMN survey.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN survey.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN survey.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN survey.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN survey.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE survey IS 'The top level organizational structure for survey data collection. '
;

-- 
-- TABLE: survey_attachment 
--

CREATE TABLE survey_attachment(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    s_id              integer           NOT NULL,
    file_name         varchar(300),
    title             varchar(300),
    description       varchar(250),
    key               varchar(1000)     NOT NULL,
    file_size         integer,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk141_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN survey_attachment.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_attachment.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_attachment.file_name IS 'The name of the file attachment.'
;
COMMENT ON COLUMN survey_attachment.title IS 'The title of the file.'
;
COMMENT ON COLUMN survey_attachment.description IS 'The description of the record.'
;
COMMENT ON COLUMN survey_attachment.key IS 'The identifying key to the file in the storage system.'
;
COMMENT ON COLUMN survey_attachment.file_size IS 'The size of the file in bytes.'
;
COMMENT ON COLUMN survey_attachment.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN survey_attachment.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_attachment.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN survey_attachment.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_attachment.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE survey_attachment IS 'A list of survey attachments.'
;

-- 
-- TABLE: survey_funding_source 
--

CREATE TABLE survey_funding_source(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    pfs_id            integer           NOT NULL,
    s_id              integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK162" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN survey_funding_source.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_funding_source.pfs_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_funding_source.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_funding_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN survey_funding_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_funding_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN survey_funding_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_funding_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE survey_funding_source IS 'A associative entity that joins surveys and funding source details.'
;

-- 
-- TABLE: survey_occurrence 
--

CREATE TABLE survey_occurrence(
    id                integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    s_id              integer                     NOT NULL,
    associatedtaxa    varchar(3000)               NOT NULL,
    lifestage         varchar(3000)               NOT NULL,
    data              json,
    geometry          geometry(geometry, 3005),
    geography         geography(geometry),
    create_date       timestamptz(6)              DEFAULT now() NOT NULL,
    create_user       integer                     NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer                     DEFAULT 0 NOT NULL,
    CONSTRAINT "PK169" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN survey_occurrence.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_occurrence.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_occurrence.associatedtaxa IS 'A string representation of the value provided for the given Darwin Core term.'
;
COMMENT ON COLUMN survey_occurrence.lifestage IS 'A string representation of the value provided for the given Darwin Core term.'
;
COMMENT ON COLUMN survey_occurrence.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN survey_occurrence.geometry IS 'The containing geometry of the record.'
;
COMMENT ON COLUMN survey_occurrence.geography IS 'The containing geography of the record.'
;
COMMENT ON COLUMN survey_occurrence.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN survey_occurrence.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_occurrence.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN survey_occurrence.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_occurrence.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE survey_occurrence IS 'Occurrence records associated with a survey.'
;

-- 
-- TABLE: survey_proprietor 
--

CREATE TABLE survey_proprietor(
    id                 integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    prt_id             integer           NOT NULL,
    s_id               integer           NOT NULL,
    fn_id              integer,
    rationale          varchar(3000)     NOT NULL,
    proprietor_name    varchar(300),
    disa_required      boolean           NOT NULL,
    create_date        timestamptz(6)    DEFAULT now() NOT NULL,
    create_user        integer           NOT NULL,
    update_date        timestamptz(6),
    update_user        integer,
    revision_count     integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK154" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN survey_proprietor.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_proprietor.prt_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_proprietor.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_proprietor.fn_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_proprietor.rationale IS 'Justification for identifying data as proprietary.'
;
COMMENT ON COLUMN survey_proprietor.proprietor_name IS 'Name of the proprietor of the data. This attribute is not required if a first nations relationship has been provided.'
;
COMMENT ON COLUMN survey_proprietor.disa_required IS 'Defines whether a data sharing agreement (DISA) is required. When set to TRUE then a DISA is required.'
;
COMMENT ON COLUMN survey_proprietor.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN survey_proprietor.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_proprietor.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN survey_proprietor.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_proprietor.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE survey_proprietor IS 'Intersection table associating surveys to proprietary types and associated meta data.'
;

-- 
-- TABLE: survey_publish_history 
--

CREATE TABLE survey_publish_history(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    s_id              integer           NOT NULL,
    publish_date      date              NOT NULL,
    key               varchar(1000),
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK165" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN survey_publish_history.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_publish_history.s_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN survey_publish_history.publish_date IS 'The date that the survey version was published.'
;
COMMENT ON COLUMN survey_publish_history.key IS 'The identifying key to the file in the storage system.'
;
COMMENT ON COLUMN survey_publish_history.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN survey_publish_history.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_publish_history.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN survey_publish_history.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN survey_publish_history.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE survey_publish_history IS 'Provides a historical listing of published dates and pointers to raw data versions.'
;

-- 
-- TABLE: system_constant 
--

CREATE TABLE system_constant(
    id                 integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    constant_name      varchar(50)       NOT NULL,
    character_value    varchar(300),
    numeric_value      numeric(10, 0),
    description        varchar(250),
    create_date        timestamptz(6)    DEFAULT now() NOT NULL,
    create_user        integer           NOT NULL,
    update_date        timestamptz(6),
    update_user        integer,
    revision_count     integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK142" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN system_constant.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_constant.constant_name IS 'The lookup name of the constant.'
;
COMMENT ON COLUMN system_constant.character_value IS 'The string value of the constant.'
;
COMMENT ON COLUMN system_constant.numeric_value IS 'The numeric value of the constant.'
;
COMMENT ON COLUMN system_constant.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_constant.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_constant.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_constant.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_constant.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_constant.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_constant IS 'A list of system constants necessary for system functionality.'
;

-- 
-- TABLE: system_role 
--

CREATE TABLE system_role(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250)      NOT NULL,
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
COMMENT ON COLUMN system_role.notes IS 'Notes associated with the record.'
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
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    uis_id                   integer           NOT NULL,
    user_identifier          varchar(200)      NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    su_id             integer           NOT NULL,
    sr_id             integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
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
COMMENT ON TABLE system_user_role IS 'A associative entity that joins system users and system role types.'
;

-- 
-- TABLE: user_identity_source 
--

CREATE TABLE user_identity_source(
    id                       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250),
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
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
COMMENT ON COLUMN user_identity_source.notes IS 'Notes associated with the record.'
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
COMMENT ON TABLE user_identity_source IS 'The source of the user identifier. This source is traditionally the system that authenticates the user. Example sources could include IDIR, BCEID and DATABASE.'
;

-- 
-- TABLE: webform_draft 
--

CREATE TABLE webform_draft(
    id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    su_id             integer           NOT NULL,
    name              varchar(300)      NOT NULL,
    data              json              NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK143" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN webform_draft.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN webform_draft.su_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN webform_draft.name IS 'The name of the draft record.'
;
COMMENT ON COLUMN webform_draft.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN webform_draft.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN webform_draft.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN webform_draft.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN webform_draft.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN webform_draft.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE webform_draft IS 'A persistent store for draft webform data. For example, if a user starts a project creation process and wants to save that information as a draft then the webform data can be persisted for subsequent reload into the project creation process.'
;

-- 
-- TABLE: wldtaxonomic_units 
--

CREATE TABLE wldtaxonomic_units(
    id                         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    unit_name1                 varchar(50)       NOT NULL,
    unit_name2                 varchar(50),
    unit_name3                 varchar(50),
    taxon_authority            varchar(100),
    code                       varchar(35),
    english_name               varchar(50),
    tty_kingdom                varchar(10)       NOT NULL,
    tty_name                   varchar(20)       NOT NULL,
    tcn_id                     numeric(10, 0),
    txn_id                     numeric(10, 0),
    sensitive_data_flag        varchar(1),
    breed_in_bc_flag           varchar(1),
    introduced_species_flag    varchar(1),
    phylo_sort_sequence        numeric(10, 0),
    start_date                 date,
    end_date                   date,
    note                       varchar(2000),
    element_subnational_id     numeric(10, 0),
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT "PK160" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN wldtaxonomic_units.id IS 'System generated UID for a taxon.'
;
COMMENT ON COLUMN wldtaxonomic_units.unit_name1 IS 'The first part of a species or taxon  name.'
;
COMMENT ON COLUMN wldtaxonomic_units.unit_name2 IS 'Idenifies the species.'
;
COMMENT ON COLUMN wldtaxonomic_units.unit_name3 IS 'Subspecies name.'
;
COMMENT ON COLUMN wldtaxonomic_units.taxon_authority IS 'Name of the author(s) who first described the species, eg. Linnae'
;
COMMENT ON COLUMN wldtaxonomic_units.code IS 'Code commonly used to identify a taxon usually at a species or su'
;
COMMENT ON COLUMN wldtaxonomic_units.english_name IS 'Common english name of the species or taxa. Ex. Grizzly Bear'
;
COMMENT ON COLUMN wldtaxonomic_units.tty_kingdom IS 'The kingdom the taxon hierarchy represents'
;
COMMENT ON COLUMN wldtaxonomic_units.tty_name IS 'The name of the taxon level, eg. PHYLUM, ORDER, GENUS, etc'
;
COMMENT ON COLUMN wldtaxonomic_units.tcn_id IS 'FK: WLD_COMMON_NAMES'
;
COMMENT ON COLUMN wldtaxonomic_units.txn_id IS 'System generated UID for a taxon.'
;
COMMENT ON COLUMN wldtaxonomic_units.sensitive_data_flag IS 'Indicates that the data is sensitive and access restricted'
;
COMMENT ON COLUMN wldtaxonomic_units.breed_in_bc_flag IS 'Indicates whether or not an animal breeds in BC.'
;
COMMENT ON COLUMN wldtaxonomic_units.introduced_species_flag IS 'Indicates that species is not native to British Columbia.'
;
COMMENT ON COLUMN wldtaxonomic_units.phylo_sort_sequence IS 'The phologenetic sequence order of the taxon.'
;
COMMENT ON COLUMN wldtaxonomic_units.start_date IS 'The date the taxon name becomes effective.'
;
COMMENT ON COLUMN wldtaxonomic_units.end_date IS 'The date a taxon becomes obsolete.'
;
COMMENT ON COLUMN wldtaxonomic_units.note IS 'Free form text about the taxon.'
;
COMMENT ON COLUMN wldtaxonomic_units.element_subnational_id IS 'Identifier that can be used to link this record to the matching Biotics field.'
;
COMMENT ON COLUMN wldtaxonomic_units.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN wldtaxonomic_units.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN wldtaxonomic_units.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN wldtaxonomic_units.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN wldtaxonomic_units.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE wldtaxonomic_units IS 'A table to mimic a view into SPI taxonomic data, specifically CWI_TXN.WLDTAXONOMIC_UNITS, for development purposes. This table should be replaced by live views of the data in production systems.'
;

-- 
-- INDEX: a_nuk1 
--

CREATE UNIQUE INDEX a_nuk1 ON activity(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref14877" 
--

CREATE INDEX "Ref14877" ON administrative_activity(aat_id)
;
-- 
-- INDEX: "Ref7878" 
--

CREATE INDEX "Ref7878" ON administrative_activity(reported_su_id)
;
-- 
-- INDEX: "Ref7879" 
--

CREATE INDEX "Ref7879" ON administrative_activity(assigned_su_id)
;
-- 
-- INDEX: "Ref15280" 
--

CREATE INDEX "Ref15280" ON administrative_activity(aast_id)
;
-- 
-- INDEX: aast_nuk1 
--

CREATE UNIQUE INDEX aast_nuk1 ON administrative_activity_status_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: aat_nuk1 
--

CREATE UNIQUE INDEX aat_nuk1 ON administrative_activity_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: cci_nuk1 
--

CREATE UNIQUE INDEX cci_nuk1 ON climate_change_initiative(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: cci_nuk1_1 
--

CREATE UNIQUE INDEX cci_nuk1_1 ON first_nations(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: fs_nuk2 
--

CREATE UNIQUE INDEX fs_nuk2 ON funding_source(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: iac_nuk1 
--

CREATE UNIQUE INDEX iac_nuk1 ON investment_action_category(fs_id, name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref7345" 
--

CREATE INDEX "Ref7345" ON investment_action_category(fs_id)
;
-- 
-- INDEX: iucn_nuk1 
--

CREATE UNIQUE INDEX iucn_nuk1 ON iucn_conservation_action_level_1_classification(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: iucn2_nuk1 
--

CREATE UNIQUE INDEX iucn2_nuk1 ON iucn_conservation_action_level_2_subclassification(name, record_end_date, iucn1_id)
;
-- 
-- INDEX: "Ref13773" 
--

CREATE INDEX "Ref13773" ON iucn_conservation_action_level_2_subclassification(iucn1_id)
;
-- 
-- INDEX: iucn3_nuk1 
--

CREATE UNIQUE INDEX iucn3_nuk1 ON iucn_conservation_action_level_3_subclassification(name, iucn2_id, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref13974" 
--

CREATE INDEX "Ref13974" ON iucn_conservation_action_level_3_subclassification(iucn2_id)
;
-- 
-- INDEX: mat_nuk1 
--

CREATE UNIQUE INDEX mat_nuk1 ON management_action_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: prm_uk1 
--

CREATE UNIQUE INDEX prm_uk1 ON permit(number)
;
-- 
-- INDEX: "Ref4593" 
--

CREATE INDEX "Ref4593" ON permit(p_id)
;
-- 
-- INDEX: "Ref15394" 
--

CREATE INDEX "Ref15394" ON permit(s_id)
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
-- INDEX: pat_uk1 
--

CREATE UNIQUE INDEX pat_uk1 ON project_attachment(p_id, file_name)
;
-- 
-- INDEX: "Ref4568" 
--

CREATE INDEX "Ref4568" ON project_attachment(p_id)
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
-- INDEX: piucn_uk1 
--

CREATE UNIQUE INDEX piucn_uk1 ON project_iucn_action_classification(p_id, iucn3_id)
;
-- 
-- INDEX: "Ref4567" 
--

CREATE INDEX "Ref4567" ON project_iucn_action_classification(p_id)
;
-- 
-- INDEX: "Ref14075" 
--

CREATE INDEX "Ref14075" ON project_iucn_action_classification(iucn3_id)
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

CREATE UNIQUE INDEX pr_nuk1 ON project_role(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: pt_nuk1 
--

CREATE UNIQUE INDEX pt_nuk1 ON project_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: prt_nuk1 
--

CREATE UNIQUE INDEX prt_nuk1 ON proprietor_type(name, (record_end_date is NULL)) where record_end_date is null
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
-- INDEX: ss_uk2 
--

CREATE UNIQUE INDEX ss_uk2 ON study_species(s_id, wu_id)
;
-- 
-- INDEX: "Ref15390" 
--

CREATE INDEX "Ref15390" ON study_species(s_id)
;
-- 
-- INDEX: "Ref16091" 
--

CREATE INDEX "Ref16091" ON study_species(wu_id)
;
-- 
-- INDEX: "Ref4581" 
--

CREATE INDEX "Ref4581" ON survey(p_id)
;
-- 
-- INDEX: "Ref15386" 
--

CREATE INDEX "Ref15386" ON survey_attachment(s_id)
;
-- 
-- INDEX: sfs_nuk1 
--

CREATE UNIQUE INDEX sfs_nuk1 ON survey_funding_source(pfs_id, s_id)
;
-- 
-- INDEX: "Ref7487" 
--

CREATE INDEX "Ref7487" ON survey_funding_source(pfs_id)
;
-- 
-- INDEX: "Ref15388" 
--

CREATE INDEX "Ref15388" ON survey_funding_source(s_id)
;
-- 
-- INDEX: "Ref15396" 
--

CREATE INDEX "Ref15396" ON survey_occurrence(s_id)
;
-- 
-- INDEX: "Ref15983" 
--

CREATE INDEX "Ref15983" ON survey_proprietor(prt_id)
;
-- 
-- INDEX: "Ref15384" 
--

CREATE INDEX "Ref15384" ON survey_proprietor(s_id)
;
-- 
-- INDEX: "Ref12785" 
--

CREATE INDEX "Ref12785" ON survey_proprietor(fn_id)
;
-- 
-- INDEX: "Ref15395" 
--

CREATE INDEX "Ref15395" ON survey_publish_history(s_id)
;
-- 
-- INDEX: sc_uk1 
--

CREATE UNIQUE INDEX sc_uk1 ON system_constant(constant_name)
;
-- 
-- INDEX: sr_nuk1 
--

CREATE UNIQUE INDEX sr_nuk1 ON system_role(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: su_nuk1 
--

CREATE UNIQUE INDEX su_nuk1 ON system_user(user_identifier, uis_id, (record_end_date is NULL)) where record_end_date is null
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

CREATE UNIQUE INDEX uis_nuk1 ON user_identity_source(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref7876" 
--

CREATE INDEX "Ref7876" ON webform_draft(su_id)
;
-- 
-- TABLE: administrative_activity 
--

ALTER TABLE administrative_activity ADD CONSTRAINT "Refadministrative_activity_type77" 
    FOREIGN KEY (aat_id)
    REFERENCES administrative_activity_type(id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refsystem_user78" 
    FOREIGN KEY (reported_su_id)
    REFERENCES system_user(id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refsystem_user79" 
    FOREIGN KEY (assigned_su_id)
    REFERENCES system_user(id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refadministrative_activity_status_type80" 
    FOREIGN KEY (aast_id)
    REFERENCES administrative_activity_status_type(id)
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

ALTER TABLE iucn_conservation_action_level_2_subclassification ADD CONSTRAINT "Refiucn_conservation_action_level_1_classification73" 
    FOREIGN KEY (iucn1_id)
    REFERENCES iucn_conservation_action_level_1_classification(id)
;


-- 
-- TABLE: iucn_conservation_action_level_3_subclassification 
--

ALTER TABLE iucn_conservation_action_level_3_subclassification ADD CONSTRAINT "Refiucn_conservation_action_level_2_subclassification74" 
    FOREIGN KEY (iucn2_id)
    REFERENCES iucn_conservation_action_level_2_subclassification(id)
;


-- 
-- TABLE: permit 
--

ALTER TABLE permit ADD CONSTRAINT "Refproject93" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;

ALTER TABLE permit ADD CONSTRAINT "Refsurvey94" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
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
-- TABLE: project_attachment 
--

ALTER TABLE project_attachment ADD CONSTRAINT "Refproject68" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
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
-- TABLE: project_iucn_action_classification 
--

ALTER TABLE project_iucn_action_classification ADD CONSTRAINT "Refproject67" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;

ALTER TABLE project_iucn_action_classification ADD CONSTRAINT "Refiucn_conservation_action_level_3_subclassification75" 
    FOREIGN KEY (iucn3_id)
    REFERENCES iucn_conservation_action_level_3_subclassification(id)
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
-- TABLE: study_species 
--

ALTER TABLE study_species ADD CONSTRAINT "Refsurvey90" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
;

ALTER TABLE study_species ADD CONSTRAINT "Refwldtaxonomic_units91" 
    FOREIGN KEY (wu_id)
    REFERENCES wldtaxonomic_units(id)
;


-- 
-- TABLE: survey 
--

ALTER TABLE survey ADD CONSTRAINT "Refproject81" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: survey_attachment 
--

ALTER TABLE survey_attachment ADD CONSTRAINT "Refsurvey86" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
;


-- 
-- TABLE: survey_funding_source 
--

ALTER TABLE survey_funding_source ADD CONSTRAINT "Refproject_funding_source87" 
    FOREIGN KEY (pfs_id)
    REFERENCES project_funding_source(id)
;

ALTER TABLE survey_funding_source ADD CONSTRAINT "Refsurvey88" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
;


-- 
-- TABLE: survey_occurrence 
--

ALTER TABLE survey_occurrence ADD CONSTRAINT "Refsurvey96" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
;


-- 
-- TABLE: survey_proprietor 
--

ALTER TABLE survey_proprietor ADD CONSTRAINT "Refproprietor_type83" 
    FOREIGN KEY (prt_id)
    REFERENCES proprietor_type(id)
;

ALTER TABLE survey_proprietor ADD CONSTRAINT "Refsurvey84" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
;

ALTER TABLE survey_proprietor ADD CONSTRAINT "Reffirst_nations85" 
    FOREIGN KEY (fn_id)
    REFERENCES first_nations(id)
;


-- 
-- TABLE: survey_publish_history 
--

ALTER TABLE survey_publish_history ADD CONSTRAINT "Refsurvey95" 
    FOREIGN KEY (s_id)
    REFERENCES survey(id)
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


-- 
-- TABLE: webform_draft 
--

ALTER TABLE webform_draft ADD CONSTRAINT "Refsystem_user76" 
    FOREIGN KEY (su_id)
    REFERENCES system_user(id)
;


