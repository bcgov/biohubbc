-- security_updates.sql
ALTER TABLE activity ADD COLUMN security_token uuid;
COMMENT ON COLUMN activity.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX act_sec_idx ON activity(security_token);

ALTER TABLE project ADD COLUMN security_token uuid;
COMMENT ON COLUMN project.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX pr_sec_idx ON project(security_token);

ALTER TABLE project_activity ADD COLUMN security_token uuid;
COMMENT ON COLUMN project_activity.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX pra_sec_idx ON project_activity(security_token);

ALTER TABLE project_attachment ADD COLUMN security_token uuid;
COMMENT ON COLUMN project_attachment.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX prat_sec_idx ON project_attachment(security_token);

ALTER TABLE survey ADD COLUMN security_token uuid;
COMMENT ON COLUMN survey.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX su_sec_idx ON survey(security_token);

ALTER TABLE survey_attachment ADD COLUMN security_token uuid;
COMMENT ON COLUMN survey_attachment.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX suat_sec_idx ON survey_attachment(security_token);

ALTER TABLE survey_occurrence ADD COLUMN security_token uuid;
COMMENT ON COLUMN survey_occurrence.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX suoc_sec_idx ON survey_occurrence(security_token);

ALTER TABLE webform_draft ADD COLUMN security_token uuid;
COMMENT ON COLUMN webform_draft.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX wf_sec_idx ON webform_draft(security_token);

-- New security table
CREATE TABLE security_table
(
    id serial NOT NULL,
    sr_id integer NOT NULL,
    security_token uuid NOT NULL,
    su_id integer,
    CONSTRAINT security_table_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

COMMENT ON TABLE security_table
    IS 'This is the security working table. This table does not need, journaling or audit trail as it is generated from the security rules.

The tables contains references to the security rule, the security token of the secured object and the optional user id for when the rule applies to a specific user.';

COMMENT ON COLUMN security_table.sr_id
    IS 'Security Rule ID from the security rule table';

CREATE INDEX sec_table_sec_idx
    ON security_table USING btree
    (security_token ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX sec_table_sr_id_idx
    ON security_table USING btree
    (sr_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX sec_table_su_id_idx
    ON security_table USING btree
    (su_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- New security rules table (minimal design for now)
CREATE TABLE security_rules
(
    id serial NOT NULL,
    name character varying(200) COLLATE pg_catalog."default" NOT NULL,
    rule_def character varying(10000) COLLATE pg_catalog."default" NOT NULL,
    "table" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    su_id integer,
    CONSTRAINT security_rules_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
