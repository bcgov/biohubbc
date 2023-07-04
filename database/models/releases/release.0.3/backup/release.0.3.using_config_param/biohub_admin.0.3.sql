--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      BioHub.DM1
--
-- Date Created : Thursday, December 31, 2020 11:55:28
-- Target DBMS : PostgreSQL 10.x-12.x
--

-- 
-- TABLE: audit_log 
--

CREATE TABLE audit_log(
    id                integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id    integer         NOT NULL,
    create_at         timestamp(6)    DEFAULT now() NOT NULL,
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

