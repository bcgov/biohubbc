import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  --
  -- TABLE: security
  --

  CREATE TABLE security(
      id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      su_id             integer,
      secr_id           integer           NOT NULL,
      security_token    uuid              NOT NULL,
      p_id              integer,
      create_date       timestamptz(6)    DEFAULT now() NOT NULL,
      create_user       integer           NOT NULL,
      update_date       timestamptz(6),
      update_user       integer,
      revision_count    integer           DEFAULT 0 NOT NULL,
      CONSTRAINT "PK176" PRIMARY KEY (id)
  )
  ;

  COMMENT ON COLUMN security.id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN security.su_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN security.secr_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN security.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.'
  ;
  COMMENT ON COLUMN security.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN security.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN security.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN security.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN security.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE security IS 'This is the security working table. This table does not need, journaling or audit trail as it is generated from the security rules. The tables contains references to the security rule, the security token of the secured object and the optional user id for when the rule applies to a specific user;'
  ;

  CREATE INDEX sec_token_user_idx
    ON ${DB_SCHEMA}.security USING btree
    (security_token ASC NULLS LAST, su_id ASC NULLS LAST)
    TABLESPACE pg_default;

  --
  -- TABLE: security_rule
  --

  CREATE TABLE security_rule(
      id                 integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name               varchar(300),
      p_id               integer,
      rule_definition    json,
      users              json,
      start_date         date              NOT NULL,
      end_date           date,
      system_rule        boolean           DEFAULT false,
      create_date        timestamptz(6)    DEFAULT now() NOT NULL,
      create_user        integer           NOT NULL,
      update_date        timestamptz(6),
      update_user        integer,
      revision_count     integer           DEFAULT 0 NOT NULL,
      CONSTRAINT "PK177" PRIMARY KEY (id)
  )
  ;

  COMMENT ON COLUMN security_rule.id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN security_rule.name IS 'The name of the record.'
  ;
  COMMENT ON COLUMN security_rule.rule_definition IS 'The definition of the rule suitable for application in code to apply the security rule.'
  ;
  COMMENT ON COLUMN security_rule.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN security_rule.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN security_rule.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN security_rule.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN security_rule.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE security_rule IS 'Security subsystem table to persist security rules.'
  ;

  --
  -- TABLE: security
  --

  ALTER TABLE security ADD CONSTRAINT "Refsystem_user100"
      FOREIGN KEY (su_id)
      REFERENCES system_user(id)
  ;

  create trigger audit_security before insert or update or delete on ${DB_SCHEMA}.security for each row execute procedure ${DB_SCHEMA}.tr_audit_trigger();
  create trigger audit_security_rule before insert or update or delete on ${DB_SCHEMA}.security_rule for each row execute procedure ${DB_SCHEMA}.tr_audit_trigger();


  -- create the views
  set search_path = ${DB_SCHEMA}_dapi_v1;
  set role ${DB_SCHEMA}_api;
  create or replace view security as select * from ${DB_SCHEMA}.security;
  create or replace view security_rule as select * from ${DB_SCHEMA}.security_rule;
  create or replace view webform_draft as select * from ${DB_SCHEMA}.webform_draft;
  create or replace view occurrence as select * from ${DB_SCHEMA}.occurrence;
  create or replace view  survey_attachment as select * from ${DB_SCHEMA}.survey_attachment;
  create or replace view  project_attachment as select * from ${DB_SCHEMA}.project_attachment;

  set role postgres;
  set search_path = ${DB_SCHEMA},public;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- drop the views
  set search_path = ${DB_SCHEMA}_dapi_v1;
  set role ${DB_SCHEMA}_api;
  drop view security;
  drop view security_rule;
  drop view webform_draft;
  drop view occurrence;

  set role postgres;
  set search_path = ${DB_SCHEMA},public;

  ALTER TABLE security drop CONSTRAINT "Refsystem_user100";
  ALTER TABLE security drop CONSTRAINT "Refsecurity_rule102";

  DROP TABLE security if exists;
  DROP TABLE security_rule if exists;

  `);
}
