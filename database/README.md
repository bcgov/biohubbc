# bcgov/biohubbc/database

## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 18.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 10.x.x  | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 14.2    | https://www.postgresql.org/download/ | PSQL database        |
| PostGIS    | 3       | https://postgis.net/                 | GIS (spatial) tools  |

<br />

## Knex Migrations / Seeds

### Migrations

An ordered list of database changes (creates, deletes, alters, etc). The latest version of your database will then be the summation of all of the migration changes, applied in order.

When writing a new migration, please review [Writing Migrations](#writing-migrations).

Note: Migration files (based on file name) only run once (if successful).

### Seeds

A set of scripts that populate the database tables with any ephemeral values required for the app to function during development. This can include dummy data so that when the app is running locally, you don't have to manually create a bunch of data in order to experience the app as it would be in a real environment.

Seeds will run in alphanumeric order, so if the order of seeds is important, consider prefixing the file name with a number.

Note: Seed files run every time regardless of past successful runs. As a result, seed files need to account for the fact that they may run repeatedly (ex: check if a record exists before adding it, in case this is not the first time this seed has run and inserting the same record again would cause an error).

### Procedures

The `procedures` directory contains a collection of scripts that, when run, create PostgreSQL stored procedures. These procedures are invoked by the application and are designed to perform specific tasks that usually envolve complex queries with several commands (for example, cascading deletes that involve multiple `DELETE` commands). Files in this directory are functionally almost identical to seeds, with the exception that they are expected to run in all environments, including production. To that end, running any one of the scripts from the `procedures` directory more than once should have no effect.

# Port forward to remote database

1. Open a terminal
2. Log in to OpenShift using the login command copied from the web-console
3. Get onto the correct project
   ```
   oc projects
   oc project <correct project name>
   ```
4. Find the database pod
   ```
   oc get pods
   ```
5. Port forward

   ```
   oc port-forward <pod name> <local port to use>:<remove port to forward>

   Ex:

   oc port-forward biohubbc-db-postgresql-dev-deploy-100 5555:5432
   ```

<br />

# General PSQL commands

## Dumping the database

Doc: https://www.postgresql.org/docs/9.6/app-pgdump.html

```
pg_dump databaseName > dumpFileName
```

### Useful options:

    --schema-only
    --data-only

## Restoring the database from a dump

Doc: https://www.postgresql.org/docs/9.6/app-pgrestore.html

```
pg_restore dumpFileName
```

### Useful options:

    --schema-only
    --data-only

<br />

# Troubleshooting

`Error: knex: Required configuration option 'client' is missing.`

- Double check that your environment variables have been set correctly, specifically `NODE_ENV`. To do this you can run the following command from the `database/src` directory:

```
export NODE_ENV = local
```

- Double check that the line endings of the `.env` file are `LF` and not `CLRF`

<br />

# Writing Migrations

Depending on the changes being made by the migration, different aspects of the database will need to be updated.

## Checklist

Important things to consider when making any migrations (not all will apply every time):

1. ** Drop/create the views**
   1. _The views need to be dropped and/or created for any model changes (if you are only changing a constraint, but not altering the model, then the views shouldn't need to be touched (but it also won't hurt anything to re-create them either))_
2. **Update table/column comments**
   1. _Ensure comments are concise, but do accurately describe the table or column sufficiently, especially if the column contains un-obvious business logic._
3. **Update/add primary key constraint**
   1. _Table primary key - Should be a surrogate key (ie: just an int that starts at 1, and increments by 1 for each row)_
4. **Update/add unique key constraint(s)**
   1. _To ensure some set of columns must be unique (acts as a key)_
5. **Update/add unique end-date key constraint(s)**
   1. _A special version of the unique key constraint when dealing with rows that have a `record_end_date` type column and uses soft deletes_
6. **Update/add foreign key constraint(s)**
   1. _To ensure a child table column references a parent table column_
7. **Update/add index(es)**
   1. _For optimizing query performance_
8. **Add standard audit columns (create/update user, create/update date, revision count)**
   1. _These 5 standard columns should be added to every table._
9. **Update/add audit/journal triggers**
   1. _Audit and journal functions exist to read/write the 5 audit columns above. Every table needs to register 2 triggers (1 to call the audit function, and 1 to call the journal function) so that on table row insert/update/delete the audit/journal functions are executed._
10. **Update functions (ex: api_delete_project, api_delete_survey)**
    1. _Double check any existing functions that may need to be updated as a result of model changes._
11. **Update seeds**
    1. Double check any existing seed files that may need to be updated as a result of model changes.

## Naming conventions

| Type | Naming Convention | More Info |
| --- | --- | --- |
| surrogate id column | `<table_name>_id` |  |
| primary key | `<table_name>_pk` |  |
| unique key constraint | `<table_name>_uk1` |  |
| unique end-date key constraint | `<table_name>_nuk1` | [Adding a unique end-date key constraint](#adding-a-unique-end-date-key-constraint) |
| foreign key constraint | `<table_name>_fk1` |  |
| index | `<table_name>_idx1` |  |
| trigger | `tr_<table_name>` <br> `tr_<column_name>` <br> `tr_<name>` |  |
| functions used by the api | `api_<name_of_function>` |  |

## Schemas

This application has main 3 schemas to be aware of.

1. `biohub`
   1. The main schema that contains the database for the application
2. `biohub_dapi_v1`
   1. A schema containing only Views of the real tables from the `biohub` schema.
   2. This is done as an added level of security. The application API makes calls against the `biohub_dapi_v1`, where it has reduced permissions. This way, it should be impossible for the API to execute a query that makes model changes or deletes tables, etc.
3. `public`
   1. The standard default schema. Contains the PostGIS functions and the Knex migration tables.

## Common migrations

### Add/remove columns or column constraints on an existing database table

```
----------------------------------------------------------------------------------------
-- Drop existing views
----------------------------------------------------------------------------------------
set search_path=biohub_dapi_v1;

drop view biohub_dapi_v1.<table_name>;

----------------------------------------------------------------------------------------
-- Update/alter tables/columns
----------------------------------------------------------------------------------------
set search_path=biohub;

alter table <table_name>
  add column <column_name_1> integer not null,
  add column <column_name_2> varchar(50),
  add column <column_name_3> date,
  add column <column_name_4> timestamptz(6) default now() not null,
  add column <column_name_5> uuid,
  alter column <column_name_6> type varchar(3000),
  alter column <column_name_7> set not null,
  drop column <column_name_8>;

COMMENT ON TABLE <column_name_1> IS '<comment_1>';
COMMENT ON TABLE <column_name_2> IS '<comment_2>';
COMMENT ON TABLE <column_name_3> IS '<comment_3>';
COMMENT ON TABLE <column_name_4> IS '<comment_4>';
COMMENT ON TABLE <column_name_5> IS '<comment_5>';
COMMENT ON TABLE <column_name_6> IS '<comment_6>';
COMMENT ON TABLE <column_name_7> IS '<comment_7>';

----------------------------------------------------------------------------------------
-- Create views
----------------------------------------------------------------------------------------
set search_path=biohub_dapi_v1;

create or replace view <table_name> as select * from biohub.<table_name>;
```

### Adding a unique end-date key constraint

This is a special type of unique index for cases where multiple records may exist, but only 1 should have a null end date.

#### Example

In this contrived example, the table tracks a persons address, even if they have been deprecated. The persons current address is identified by the fact that it is the only record with a NULL record_end_date.

| id  | name | Address        | record_end_date |
| --- | ---- | -------------- | --------------- |
| 1   | John | 123 Old Street | 2023-01-10      |
| 1   | John | 456 Old Street | 2023-04-15      |
| 1   | John | 789 New Road   | NULL            |

In this scenario, we need a special constraint on the table to ensure that only 1 record can have a NULL record_end_date at a time.

#### Why?

In PostgreSQL, all NULL values are considered unique (ie: NULL !== NULL).

As a result, a regular constraint on `(address, record_end_date)` will not work.

If we attempted to insert the same address into the table above, resulting in 2 rows with the values `(789 New Road, NULL)`, Postgres will consider them to be different rows, because the NULL value in the one row is unique from the NULL value in the other row, because NULL !== NULL.

#### Solution

_Note: alternative solutions may be possible, this is just one way to resolve the issue._

```
set search_path=biohub;

CREATE UNIQUE INDEX <table_name>_nuk1 ON <table_name>(<column_name_1>, (<end_date_column_name> is NULL)) where <end_date_column_name> is null;

```

This constraint will allow the table to contain any number of `(123 Old Street, 2023-07-20)` rows (because they are all end-dated), but only allow 1 `(789 New Road, NULL)` row (which represents the single non-end-dated active row).

### Create new table with foreign key child table

```
----------------------------------------------------------------------------------------
-- Create parent table
----------------------------------------------------------------------------------------
set search_path=biohub;

CREATE TABLE <table_name_1>(
  <table_name_1>_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
  <column_name_1>          varchar(100)      NOT NULL,
  <column_name_2>          varchar(250),
  <record_effective_date>  date              NOT NULL,
  <record_end_date>        date,
  create_date              timestamptz(6)    DEFAULT now() NOT NULL,
  create_user              integer           NOT NULL,
  update_date              timestamptz(6),
  update_user              integer,
  revision_count           integer           DEFAULT 0 NOT NULL,
  CONSTRAINT <table_name_1>_pk PRIMARY KEY (<table_name_1>_id)
);

COMMENT ON COLUMN <table_name_1>.<table_name_1>_id        IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_1>.<column_name_1>          IS '<column_name_1_comment>';
COMMENT ON COLUMN <table_name_1>.<column_name_2>          IS '<column_name_2_comment>';
COMMENT ON COLUMN <table_name_1>.<record_effective_date>  IS 'Record level effective date.';
COMMENT ON COLUMN <table_name_1>.<record_end_date>        IS 'Record level end date.';
COMMENT ON COLUMN <table_name_1>.create_date              IS 'The datetime the record was created.';
COMMENT ON COLUMN <table_name_1>.create_user              IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_1>.update_date              IS 'The datetime the record was updated.';
COMMENT ON COLUMN <table_name_1>.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_1>.revision_count           IS 'Revision count used for concurrency control.';
COMMENT ON TABLE  <table_name_1>                          IS '<table_name_1_comment>';

-- Add unique end-date key constraint (assuming the table has a record_end_date column and handles deletions as soft deletes by setting the record_end_date column)
CREATE UNIQUE INDEX <table_name_1>_nuk1 ON <table_name_1>(<column_name_1>, (<record_end_date> is NULL)) where <record_end_date> is null;

-- Create audit and journal triggers
create trigger audit_<table_name_1> before insert or update or delete on <table_name_1> for each row execute procedure tr_audit_trigger();
create trigger journal_<table_name_1> after insert or update or delete on <table_name_1> for each row execute procedure tr_journal_trigger();

----------------------------------------------------------------------------------------
-- Create child table
----------------------------------------------------------------------------------------
CREATE TABLE <table_name_2>(
  <table_name_2>_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
  <column_name_1>          varchar(100)      NOT NULL,
  <column_name_2>          varchar(250),
  <record_effective_date>  date              NOT NULL,
  <record_end_date>        date,
  create_date              timestamptz(6)    DEFAULT now() NOT NULL,
  create_user              integer           NOT NULL,
  update_date              timestamptz(6),
  update_user              integer,
  revision_count           integer           DEFAULT 0 NOT NULL,
  CONSTRAINT <table_name_2>_pk PRIMARY KEY (<table_name_2>_id)
);

COMMENT ON COLUMN <table_name_2>.<table_name_2>_id        IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_2>.<column_name_1>          IS '<column_name_1_comment>';
COMMENT ON COLUMN <table_name_2>.<column_name_2>          IS '<column_name_2_comment>';
COMMENT ON COLUMN <table_name_2>.<record_effective_date>  IS 'Record level effective date.';
COMMENT ON COLUMN <table_name_2>.<record_end_date>        IS 'Record level end date.';
COMMENT ON COLUMN <table_name_2>.create_date              IS 'The datetime the record was created.';
COMMENT ON COLUMN <table_name_2>.create_user              IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_2>.update_date              IS 'The datetime the record was updated.';
COMMENT ON COLUMN <table_name_2>.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_2>.revision_count           IS 'Revision count used for concurrency control.';
COMMENT ON TABLE  <table_name_2>                          IS '<table_name_2_comment>';

-- Add foreign key constraint from child table to parent table on <column_name_2>
ALTER TABLE <table_name_2> ADD CONSTRAINT <table_name_2>_fk1
  FOREIGN KEY (<column_name_2>)
  REFERENCES <table_name_1>(<column_name_2>);

-- Add unique end-date key constraint (assuming the table has a record_end_date column and handles deletions as soft deletes by setting the record_end_date column)
CREATE UNIQUE INDEX <table_name_2>_nuk1 ON <table_name_2>(<column_name_1>, (<record_end_date> is NULL)) where <record_end_date> is null;

-- Add unique constraint
CREATE UNIQUE INDEX <table_name_2>_uk1 ON <table_name_2>(<column_name_1>, <column_name_2>);

-- Add additional index (as needed, for query performance)
CREATE INDEX <table_name_2>_idx1 ON <table_name_2>(<column_name_2>);

-- Create audit and journal triggers
create trigger audit_<table_name_2> before insert or update or delete on <table_name_2> for each row execute procedure tr_audit_trigger();
create trigger journal_<table_name_2> after insert or update or delete on <table_name_2> for each row execute procedure tr_journal_trigger();

----------------------------------------------------------------------------------------
-- Create views
----------------------------------------------------------------------------------------
set search_path=biohub_dapi_v1;

create or replace view <table_name_1> as select * from biohub.<table_name_1>;
create or replace view <table_name_2> as select * from biohub.<table_name_2>;
```

### Create new join table

Creating a 'join' table (<table_name_1>) that connects 2 tables (<foreign_table_1>, <foreign_table_2>).

_Note: The example below does not include the creation of the foreign tables (assumes they have already been accounted for)._

_Note: Indexes must be created separately, as foreign keys do not automatically create an index._

```
----------------------------------------------------------------------------------------
-- Create join table
----------------------------------------------------------------------------------------
set search_path=biohub;

CREATE TABLE <table_name_1>(
  <table_name_1>_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
  <foreign_column_1>      integer           NOT NULL,
  <foreign_column_2>      integer           NOT NULL,
  create_date             timestamptz(6)    DEFAULT now() NOT NULL,
  create_user             integer           NOT NULL,
  update_date             timestamptz(6),
  update_user             integer,
  revision_count          integer           DEFAULT 0 NOT NULL,
  CONSTRAINT <table_name_1>_pk PRIMARY KEY (<table_name_1>_id)
);

COMMENT ON COLUMN <table_name_1>.<table_name_1>_id     IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_1>.<foreign_column_1>    IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_1>.<foreign_column_2>    IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_1>.create_date           IS 'The datetime the record was created.';
COMMENT ON COLUMN <table_name_1>.create_user           IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_1>.update_date           IS 'The datetime the record was updated.';
COMMENT ON COLUMN <table_name_1>.update_user           IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_1>.revision_count        IS 'Revision count used for concurrency control.';
COMMENT ON TABLE  <table_name_1>                       IS 'A associative entity that joins system user and system role.';

-- Add unique key constraint
CREATE UNIQUE INDEX <table_name_1>_uk1 ON <table_name_1>(<foreign_column_1>, <foreign_column_2>);

-- Add foreign key constraint
ALTER TABLE <table_name_1> ADD CONSTRAINT <table_name_1>_fk1
    FOREIGN KEY (<foreign_column_1>)
    REFERENCES <foreign_table_1>(<foreign_column_1>);

ALTER TABLE <table_name_1> ADD CONSTRAINT <table_name_1>_fk2
    FOREIGN KEY (<foreign_column_2>)
    REFERENCES <foreign_table_2>(<foreign_column_2>);

-- Add indexes on key columns
CREATE INDEX <table_name_1>_idx1 ON <table_name_1>(<foreign_column_1>);

CREATE INDEX <table_name_1>_idx2 ON <table_name_1>(<foreign_column_2>);

----------------------------------------------------------------------------------------
-- Create views
----------------------------------------------------------------------------------------
set search_path=biohub_dapi_v1;

create or replace view <table_name_1> as select * from biohub.<table_name_1>;

```

## Miscellaneous Migration Snippets

These are loose snippets, and not complete examples for migrations.

### Add Unique Key Constraint

```
CREATE UNIQUE INDEX <table_name_2>_uk1 ON <table_name_2>(<column_name_1>, <column_name_2>);
```

### Unique End-Date Key Constraint

```
CREATE UNIQUE INDEX <table_name_2>_nuk1 ON <table_name_2>(<column_name_1>, (<record_end_date> is NULL)) where <record_end_date> is null;
```

### Foreign Key Constraint

```
ALTER TABLE <table_name_2> ADD CONSTRAINT <table_name_2>_fk1
  FOREIGN KEY (<column_name_2>)
  REFERENCES <table_name_1>(<column_name_2>);
```

### Add Index

```
CREATE INDEX <table_name_2>_idx1 ON <table_name_2>(<column_name_2>);
```

### Audit/Journal Columns

Should be added to every table.

```
create_date      timestamptz(6)    DEFAULT now() NOT NULL,
create_user      integer           NOT NULL,
update_date      timestamptz(6),
update_user      integer,
revision_count   integer           DEFAULT 0 NOT NULL,
```

### Create Audit/Journal Triggers

Should be added to every table.

```
create trigger audit_<table_name_2> before insert or update or delete on <table_name_2> for each row execute procedure tr_audit_trigger();
create trigger journal_<table_name_2> after insert or update or delete on <table_name_2> for each row execute procedure tr_journal_trigger();

```

### Alter Audit/Journal Trigger Names

Probably a rare situation, that only applies if you are re-naming a table and want the name of the triggers to reflect the new table name

```
ALTER TRIGGER audit_funding_source ON agency RENAME TO audit_agency;
ALTER TRIGGER journal_funding_source ON agency RENAME TO journal_agency;
```

### Table/Column Comments

```
COMMENT ON COLUMN <table_name_2>.<column_name_1> IS '<column_name_1_comment>';
COMMENT ON TABLE <table_name_2> IS '<table_name_2_comment>';
```
