--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      BioHub.DM1
--
-- Date Created : Wednesday, February 17, 2021 09:37:49
-- Target DBMS : PostgreSQL 10.x-12.x
--

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
-- INDEX: as_nuk1
--

CREATE UNIQUE INDEX as_nuk1 ON ancillary_species(name, p_id)
;
--
-- INDEX: "Ref4544"
--

CREATE INDEX "Ref4544" ON ancillary_species(p_id)
;
--
-- INDEX: fs_nuk1
--

CREATE UNIQUE INDEX fs_nuk1 ON focal_species(name, p_id)
;
--
-- INDEX: "Ref4543"
--

CREATE INDEX "Ref4543" ON focal_species(p_id)
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


