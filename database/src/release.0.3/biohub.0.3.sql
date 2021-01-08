--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      BioHub.DM1
--
-- Date Created : Tuesday, December 29, 2020 14:06:11
-- Target DBMS : PostgreSQL 10.x-12.x
--

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
-- TABLE: funding_agency 
--

CREATE TABLE funding_agency(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN funding_agency.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN funding_agency.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN funding_agency.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN funding_agency.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN funding_agency.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN funding_agency.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN funding_agency.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN funding_agency.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE funding_agency IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: land_based_investment_strategy 
--

CREATE TABLE land_based_investment_strategy(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT "PK83" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN land_based_investment_strategy.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN land_based_investment_strategy.name IS 'The name of the Land Based Investment Strategy (LBIS).'
;
COMMENT ON COLUMN land_based_investment_strategy.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN land_based_investment_strategy.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN land_based_investment_strategy.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN land_based_investment_strategy.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN land_based_investment_strategy.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN land_based_investment_strategy.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN land_based_investment_strategy.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE land_based_investment_strategy IS 'Land Based Investment Strategy (LBIS)'
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
-- TABLE: project 
--

CREATE TABLE project(
    id                                     integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                   varchar(50)      NOT NULL,
    objectives                             varchar(2000)    NOT NULL,
    scientific_collection_permit_number    varchar(50)      NOT NULL,
    management_recovery_action             character(1),
    location_description                   varchar(2000),
    start_date                             date             NOT NULL,
    end_date                               date,
    results                                varchar(2000),
    caveats                                varchar(2000),
    comments                               varchar(2000),
    create_date                            timestamp(6)     DEFAULT now() NOT NULL,
    create_user                            integer          NOT NULL,
    update_date                            timestamp(6),
    update_user                            integer,
    revision_count                         integer          DEFAULT 0 NOT NULL,
    CONSTRAINT "PK45" PRIMARY KEY (id)
)
;



COMMENT ON COLUMN project.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.name IS 'Name given to a project'
;
COMMENT ON COLUMN project.objectives IS 'The objectives for the project. What questions is this project trying to answer?'
;
COMMENT ON COLUMN project.scientific_collection_permit_number IS 'Permit number provided by FrontCounter BC.'
;
COMMENT ON COLUMN project.management_recovery_action IS 'Identifies if the project addresses a management or recovery action.'
;
COMMENT ON COLUMN project.location_description IS 'The location description.'
;
COMMENT ON COLUMN project.start_date IS 'The record start date.'
;
COMMENT ON COLUMN project.results IS 'A description of the results of the project.'
;
COMMENT ON COLUMN project.caveats IS 'Important stipulations, conditions, or limitations to the project results.'
;
COMMENT ON COLUMN project.comments IS 'Comments about the project.'
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
-- TABLE: project_funding_agency 
--

CREATE TABLE project_funding_agency(
    id                           integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    fa_id                        integer         NOT NULL,
    p_id                         integer         NOT NULL,
    lbis_id                      integer,
    funding_agency_project_id    varchar(50),
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



COMMENT ON COLUMN project_funding_agency.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_agency.fa_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_agency.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_agency.lbis_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_agency.funding_agency_project_id IS 'Idenfification number used by funding agency to reference the project'
;
COMMENT ON COLUMN project_funding_agency.funding_amount IS 'Funding amount from funding agency.'
;
COMMENT ON COLUMN project_funding_agency.funding_start_date IS 'Start date for funding from agency or Ministry.'
;
COMMENT ON COLUMN project_funding_agency.funding_end_date IS 'End date for funding from agency or Ministry.'
;
COMMENT ON COLUMN project_funding_agency.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_funding_agency.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_agency.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_funding_agency.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_agency.revision_count IS 'Revision count used for concurrency control.'
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
-- TABLE: project_region 
--

CREATE TABLE project_region(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    p_id              integer         NOT NULL,
    common_code       varchar(30)     NOT NULL,
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
COMMENT ON COLUMN project_region.common_code IS 'A common code.'
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
-- TABLE: proponent 
--

CREATE TABLE proponent(
    id                       integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)     NOT NULL,
    p_id                     integer         NOT NULL,
    record_end_date          date,
    record_effective_date    date            NOT NULL,
    create_date              timestamp(6)    DEFAULT now() NOT NULL,
    create_user              integer         NOT NULL,
    update_date              timestamp(6),
    update_user              integer,
    revision_count           integer         DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_2_2 PRIMARY KEY (id)
)
;



COMMENT ON COLUMN proponent.id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN proponent.p_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN proponent.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN proponent.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN proponent.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN proponent.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN proponent.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN proponent.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN proponent.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE proponent IS 'Agency advocating for the project. For example: Regional Office, Ministry Branch, NGO, or Industry leading the project.'
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
    notes                    varchar(2000),
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
    notes                    varchar(2000),
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
-- INDEX: cci_nuk1 
--

CREATE UNIQUE INDEX cci_nuk1 ON climate_change_initiative(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: fa_nuk1 
--

CREATE UNIQUE INDEX fa_nuk1 ON funding_agency(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: lbi_nuk1 
--

CREATE UNIQUE INDEX lbi_nuk1 ON land_based_investment_strategy(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: mat_nuk1 
--

CREATE UNIQUE INDEX mat_nuk1 ON management_action_type(name, (record_end_date is NULL)) where record_end_date is null
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
-- INDEX: pfa_uk1 
--

CREATE UNIQUE INDEX pfa_uk1 ON project_funding_agency(fa_id, p_id, lbis_id, funding_agency_project_id)
;
-- 
-- INDEX: "Ref8326" 
--

CREATE INDEX "Ref8326" ON project_funding_agency(lbis_id)
;
-- 
-- INDEX: "Ref7319" 
--

CREATE INDEX "Ref7319" ON project_funding_agency(fa_id)
;
-- 
-- INDEX: "Ref4520" 
--

CREATE INDEX "Ref4520" ON project_funding_agency(p_id)
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
-- INDEX: pr_uk1 
--

CREATE UNIQUE INDEX pr_uk1 ON project_region(p_id)
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
-- INDEX: pro_nuk1 
--

CREATE UNIQUE INDEX pro_nuk1 ON proponent(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref4539" 
--

CREATE INDEX "Ref4539" ON proponent(p_id)
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
-- TABLE: project_funding_agency 
--

ALTER TABLE project_funding_agency ADD CONSTRAINT "Refland_based_investment_strategy26" 
    FOREIGN KEY (lbis_id)
    REFERENCES land_based_investment_strategy(id)
;

ALTER TABLE project_funding_agency ADD CONSTRAINT "Reffunding_agency19" 
    FOREIGN KEY (fa_id)
    REFERENCES funding_agency(id)
;

ALTER TABLE project_funding_agency ADD CONSTRAINT "Refproject20" 
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
-- TABLE: project_region 
--

ALTER TABLE project_region ADD CONSTRAINT "Refproject24" 
    FOREIGN KEY (p_id)
    REFERENCES project(id)
;


-- 
-- TABLE: proponent 
--

ALTER TABLE proponent ADD CONSTRAINT "Refproject39" 
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


