# bcgov/biohubbc/database

## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 14.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 12.5    | https://www.postgresql.org/download/ | PSQL database        |
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

# Writing Migrations

Depending on the changes being made by the migration, different aspects of the database will need to be updated.

Important things to consider when making any migrations (not all will apply every time):

1. Drop/Re-create the views
2. Update table/column comments
3. Update/add primary key constraint
4. Update/add unique key constraint(s)
5. Update/add foreign key constraint(s)
6. Add standard audit columns (create/update user, create/update date, revision count)
7. Update/add audit/journal triggers
8. Update functions (ex: api_delete_project, api_delete_survey)
9. Update seeds

## Naming conventions

#### primary id column

- `<table_name>_id`

#### primary key

- `<table_name>_pk`

#### unique key constraint

- `<table_name>_uk1`

#### end-date unique key constraint

- `<table_name>_nuk1`  
  See [Adding an end_date unique constraint](#adding-an-end_date-unique-key-constraint)

#### foreign key constraint

- `<table_name>_fk1`

#### index

- `<table_name>_idx1`

#### trigger

- `tr_<table_name>`
- `tr_<column_name>`
- `tr_<name>`

#### functions used by the api

- `api_<name_of_function>`

## Common migrations

### Dropping columns or column constraints from an existing database table

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
  drop column <column_name_1>,
  alter column <column_name_2> drop not null;

----------------------------------------------------------------------------------------
-- Create views
----------------------------------------------------------------------------------------
set search_path=biohub_dapi_v1;

create or replace view <table_name> as select * from biohub.<table_name>;

```

### Adding columns or column constraints to an existing database table

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
  alter column <column_name_7> set not null;

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

### Adding an end_date unique key constraint

This is a special type of unique index for cases where multiple records may exist, but only 1 should have a null end date.

Why? In PostgreSQL, all NULL values are considered unique. And so a regular constraint on `(name, record_end_date)` will not work: psql will consider row 1 `('John', NULL)` to be different from row 2 `('John', NULL)`. To get around this, a modified unique index can be used, as shown in the example below.

Note: alternative solutions may still be possible, this is just one way to resolve the issue.

```
set search_path=biohub;

CREATE UNIQUE INDEX <table_name>_nuk1 ON <table_name>(<column_name_1>, (<end_date_column_name> is NULL)) where <end_date_column_name> is null;

```

This will allow the table to contain any number of `('John', 2023-07-20)` rows (because they are all end dated), but only 1 `('John', NULL)` row (the active row).

### Create new table with foreign key child table

```
----------------------------------------------------------------------------------------
-- Create parent table
----------------------------------------------------------------------------------------
set search_path=biohub;

CREATE TABLE <table_name_1>(
  <table_name_1>_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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

COMMENT ON COLUMN <table_name_1>.<table_name_1>_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_1>.<column_name_1> IS '<column_name_1_comment>';
COMMENT ON COLUMN <table_name_1>.<column_name_2> IS '<column_name_2_comment>';
COMMENT ON COLUMN <table_name_1>.<record_effective_date> IS 'Record level effective date.';
COMMENT ON COLUMN <table_name_1>.<record_end_date> IS 'Record level end date.';
COMMENT ON COLUMN <table_name_1>.create_date IS 'The datetime the record was created.';
COMMENT ON COLUMN <table_name_1>.create_user IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_1>.update_date IS 'The datetime the record was updated.';
COMMENT ON COLUMN <table_name_1>.update_user IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_1>.revision_count IS 'Revision count used for concurrency control.';
COMMENT ON TABLE <table_name_1> IS '<table_name_comment>';

-- Add unique constraint (assuming the table has a record_end_date column and handles deletions as soft deletes by setting the record_end_date column)
CREATE UNIQUE INDEX <table_name_1>_nuk1 ON <table_name_1>(<column_name_1>, (<record_end_date> is NULL)) where <record_end_date> is null;

-- Create audit and journal triggers
create trigger audit_<table_name_1> before insert or update or delete on <table_name_1> for each row execute procedure tr_audit_trigger();
create trigger journal_<table_name_1> after insert or update or delete on <table_name_1> for each row execute procedure tr_journal_trigger();

----------------------------------------------------------------------------------------
-- Create child table
----------------------------------------------------------------------------------------
CREATE TABLE <table_name_2>(
  <table_name_2>_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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

COMMENT ON COLUMN <table_name_2>.<table_name_2>_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN <table_name_2>.<column_name_1> IS '<column_name_1_comment>';
COMMENT ON COLUMN <table_name_2>.<column_name_2> IS '<column_name_2_comment>';
COMMENT ON COLUMN <table_name_2>.<record_effective_date> IS 'Record level effective date.';
COMMENT ON COLUMN <table_name_2>.<record_end_date> IS 'Record level end date.';
COMMENT ON COLUMN <table_name_2>.create_date IS 'The datetime the record was created.';
COMMENT ON COLUMN <table_name_2>.create_user IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_2>.update_date IS 'The datetime the record was updated.';
COMMENT ON COLUMN <table_name_2>.update_user IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN <table_name_2>.revision_count IS 'Revision count used for concurrency control.';
COMMENT ON TABLE <table_name_2> IS '<table_name_comment>';

-- Add unique constraint (assuming the table has a record_end_date column and handles deletions as soft deletes by setting the record_end_date column)
CREATE UNIQUE INDEX <table_name_2>_nuk1 ON <table_name_2>(<column_name_1>, (<record_end_date> is NULL)) where <record_end_date> is null;

-- Add foreign key constraint from child table to parent table on <column_name_2>
ALTER TABLE <table_name2> ADD CONSTRAINT <table_name2>_fk1
  FOREIGN KEY (<column_name_2>)
  REFERENCES <table_name_1>(<column_name_2>);

-- Add additional index (as needed)
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
