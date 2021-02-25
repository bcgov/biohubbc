
-- Standard Alter Table SQL


DROP INDEX pfa_uk1
;

DROP INDEX "Ref8326"
;

DROP INDEX "Ref7319"
;

DROP INDEX "Ref4520"
;

DROP INDEX "Ref4539"
;

DROP INDEX pro_nuk1
;

DROP TABLE proponent cascade
;

DROP TABLE funding_agency cascade
;

DROP TABLE land_based_investment_strategy cascade
;

DROP TABLE project_funding_agency cascade
;

ALTER TABLE project
    DROP COLUMN results cascade 
;

-- Drop Constraint, Rename and Create Table SQL

CREATE TABLE stakeholder_partnership
(
    "id"           integer       NOT NULL GENERATED ALWAYS AS IDENTITY
        (START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        NO CYCLE),
    "name"         varchar(50)   NOT NULL,
    p_id           integer       NOT NULL,
    create_date    timestamp(6)  NOT NULL DEFAULT now(),
    create_user    integer       NOT NULL,
    update_date    timestamp(6),
    update_user    integer,
    revision_count integer       NOT NULL DEFAULT 0,
    CONSTRAINT pk49_2_2 PRIMARY KEY ("id")
)
WITH (
    OIDS=false
)
;

CREATE TABLE project_funding_source
(
    "id"                      integer       NOT NULL GENERATED ALWAYS AS IDENTITY
        (START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        NO CYCLE),
    p_id                      integer       NOT NULL,
    iac_id                    integer       NOT NULL,
    funding_source_project_id varchar(50),
    funding_amount            money         NOT NULL,
    funding_start_date        date          NOT NULL,
    funding_end_date          date          NOT NULL,
    create_date               timestamp(6)  NOT NULL DEFAULT now(),
    create_user               integer       NOT NULL,
    update_date               timestamp(6),
    update_user               integer,
    revision_count            integer       NOT NULL DEFAULT 0,
    CONSTRAINT pk55_1 PRIMARY KEY ("id")
)
WITH (
    OIDS=false
)
;

CREATE TABLE project_first_nation
(
    "id"           integer       NOT NULL GENERATED ALWAYS AS IDENTITY
        (START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        NO CYCLE),
    p_id           integer       NOT NULL,
    fn_id          integer       NOT NULL,
    create_date    timestamp(6)  NOT NULL DEFAULT now(),
    create_user    integer       NOT NULL,
    update_date    timestamp(6),
    update_user    integer,
    revision_count integer       NOT NULL DEFAULT 0,
    CONSTRAINT pk55_3_1 PRIMARY KEY ("id")
)
WITH (
    OIDS=false
)
;

CREATE TABLE first_nations
(
    "id"                  integer       NOT NULL GENERATED ALWAYS AS IDENTITY
        (START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        NO CYCLE),
    "name"                varchar(300)   NOT NULL,
    record_end_date       date,
    record_effective_date date          NOT NULL,
    description           varchar(250),
    create_date           timestamp(6)  NOT NULL DEFAULT now(),
    create_user           integer       NOT NULL,
    update_date           timestamp(6),
    update_user           integer,
    revision_count        integer       NOT NULL DEFAULT 0,
    CONSTRAINT pk49_2_3 PRIMARY KEY ("id")
)
WITH (
    OIDS=false
)
;

CREATE TABLE funding_source
(
    "id"                  integer       NOT NULL GENERATED ALWAYS AS IDENTITY
        (START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        NO CYCLE),
    "name"                varchar(300)   NOT NULL,
    record_end_date       date,
    record_effective_date date          NOT NULL,
    description           varchar(250),
    create_date           timestamp(6)  NOT NULL DEFAULT now(),
    create_user           integer       NOT NULL,
    update_date           timestamp(6),
    update_user           integer,
    revision_count        integer       NOT NULL DEFAULT 0,
    CONSTRAINT pk49_1 PRIMARY KEY ("id")
)
WITH (
    OIDS=false
)
;

CREATE TABLE investment_action_category
(
    "id"                  integer       NOT NULL GENERATED ALWAYS AS IDENTITY
        (START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        NO CYCLE),
    fs_id                 integer       NOT NULL,
    "name"                varchar(50)   NOT NULL,
    record_end_date       date,
    record_effective_date date          NOT NULL,
    description           varchar(250),
    create_date           timestamp(6)  NOT NULL DEFAULT now(),
    create_user           integer       NOT NULL,
    update_date           timestamp(6),
    update_user           integer,
    revision_count        integer       NOT NULL DEFAULT 0,
    CONSTRAINT "PK83" PRIMARY KEY ("id")
)
WITH (
    OIDS=false
)
;

-- Alter Index SQL


CREATE UNIQUE INDEX pro_nuk1 ON stakeholder_partnership  
	("name",
	 p_id)
;

CREATE  INDEX "Ref4539" ON stakeholder_partnership  
	(p_id)
;

CREATE  INDEX "Ref4520" ON project_funding_source  
	(p_id)
;

CREATE UNIQUE INDEX pfs_uk1 ON project_funding_source  
	(p_id,
	 funding_source_project_id,
	 iac_id)
;

CREATE  INDEX "Ref8351" ON project_funding_source  
	(iac_id)
;

CREATE UNIQUE INDEX pci_uk1_1 ON project_first_nation  
	(p_id,
	 fn_id)
;

CREATE  INDEX "Ref4549" ON project_first_nation  
	(p_id)
;

CREATE  INDEX "Ref12750" ON project_first_nation  
	(fn_id)
;

CREATE UNIQUE INDEX cci_nuk1_1 ON first_nations  
	("name",
	 (record_end_date is NULL)) where record_end_date is null
;

CREATE UNIQUE INDEX fs_nuk2 ON funding_source  
	("name",
	 (record_end_date is NULL)) where record_end_date is null
;

CREATE UNIQUE INDEX lac_nuk1 ON investment_action_category  
	("name",
	 (record_end_date is NULL)) where record_end_date is null
;

CREATE  INDEX "Ref7345" ON investment_action_category  
	(fs_id)   
;

-- Add Referencing Foreign Keys SQL


ALTER TABLE investment_action_category
    ADD 
    FOREIGN KEY (fs_id)
    REFERENCES funding_source ("id")
    MATCH SIMPLE
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    NOT VALID

;

ALTER TABLE stakeholder_partnership
    ADD 
    FOREIGN KEY (p_id)
    REFERENCES project ("id")
    MATCH SIMPLE
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    NOT VALID
;

ALTER TABLE project_funding_source
    ADD 
    FOREIGN KEY (p_id)
    REFERENCES project ("id")
    MATCH SIMPLE
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    NOT VALID
;

ALTER TABLE project_first_nation
    ADD 
    FOREIGN KEY (p_id)
    REFERENCES project ("id")
    MATCH SIMPLE
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    NOT VALID
;

COMMENT ON TABLE stakeholder_partnership IS 'Stakeholder partnerships associated with the project.'

;

COMMENT ON COLUMN stakeholder_partnership."id" IS 'System generated surrogate primary key identifier.'

;

COMMENT ON COLUMN stakeholder_partnership."name" IS 'The name of the stakeholder.'

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

COMMENT ON TABLE project_funding_source IS 'Project funding source details.'

;

COMMENT ON COLUMN project_funding_source."id" IS 'System generated surrogate primary key identifier.'

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

COMMENT ON COLUMN project_first_nation."id" IS 'System generated surrogate primary key identifier.'

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

COMMENT ON TABLE first_nations IS 'A list of first nations.'

;

COMMENT ON COLUMN first_nations."id" IS 'System generated surrogate primary key identifier.'

;

COMMENT ON COLUMN first_nations."name" IS 'Name of the First Nation.'

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

COMMENT ON TABLE funding_source IS 'Agency or Ministry funding the project.'

;

COMMENT ON COLUMN funding_source."id" IS 'System generated surrogate primary key identifier.'

;

COMMENT ON COLUMN funding_source."name" IS 'The name of the funding source.'

;

COMMENT ON COLUMN funding_source.record_end_date IS 'Record level end date.'

;

COMMENT ON COLUMN funding_source.record_effective_date IS 'Record level effective date.'

;

COMMENT ON COLUMN funding_source.description IS 'The description of the record.'

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

COMMENT ON TABLE investment_action_category IS 'The investment or action categories associated with the funding source. Funding sources may have no investment or action category thus the default category of Not Applicable is used.'

;

COMMENT ON COLUMN investment_action_category."id" IS 'System generated surrogate primary key identifier.'

;

COMMENT ON COLUMN investment_action_category.fs_id IS 'System generated surrogate primary key identifier.'

;

COMMENT ON COLUMN investment_action_category."name" IS 'The name of the investment or action category.'

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
