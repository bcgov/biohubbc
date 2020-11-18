# bcgov/biohubbc/database

## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 10.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 9.6     | https://www.postgresql.org/download/ | PSQL database        |

<br />

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

- Double check that your environment variables have been set correctly.
- Double check that the line endings of the `.env` file are `LF` and not `CLRF`
