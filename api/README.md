# bcgov/biohubbc/api

## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 10.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 9.6     | https://www.postgresql.org/download/ | PSQL database        |

<br />

# API Specification

The root API schema is defined in `./src/openapi/api.ts`.

If this project is running in docker you can view the api docs at: `http://localhost:6100/api/api-docs/` or via nginx at `http://localhost/api/api-docs/`.

This project uses npm package `express-openapi` via `./app.ts` to automatically generate the express server and its routes, based on the contents of the `./src/openapi/api.ts` and the `./src/path/` content.

- The endpoint paths are defined based on the folder structure of the `./src/paths/` folder.
  - Example: `<host>/api/activity` is handled by `./src/paths/activity.ts`
  - Example: `<host>/api/activity/{activityId} ` is handled by `./src/paths/activity/{activityId}.ts`

Recommend reviewing the [Open API Specification](https://swagger.io/docs/specification/about/) before making any changes to any of the API schemas.

<br />

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `ESlint` and `Prettier`. The reason for this, is that you get the best of both worlds: ESlint's larger selection of linting rules with Prettier's robust formatting rules. EditorConfig is additionally used to add enforce some basic IDE formatting rules.

### Technologies used

- [ESlint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [EditorConfig](http://editorconfig.org)

### Configuration files

- ESlint
  - .eslintrc
  - .eslintignore
- Prettier
  - .prettierrc
  - .prettierignore
- EditorConfig
  - .editorconfig

## Run Linters

- Lint the `*.ts` files using `ESLint`.

```
npm run lint
```

## Run Linters + Formatters

_Note: In the worst case scenario, where linting/formatting has been neglected, then these `lint:fix` commands have the potential to create 100's of file changes. In this case, it is recommended to only run these commands as part of a separate commit._

_Note: Not all linting/formatting errors can be automatically fixed, and will require human intervention._

- Lint and fix the `*.ts` files using `ESLint` + `Prettier`.

```
npm run lint:fix
```

<br />

# Logging

A centralized logger has been created (see `api/utils/logger.ts`).

## Logger configuration

The loggers log level can be configured via an environment variable: `LOG_LEVEL`

Set this variable to one of: `error`, `warn`, `info`, `debug`

Default value: `info`

## Instantiating the logger in your class/file

```
const log = require('./logger)('a meaningful label, typically the class name`)
```

## Using the logger

```
log.error({ label: 'functionName', message: 'Used when logging unexpected errors. Generally these will only exist in catch() blocks', error })

log.warn({ label: 'functionName', message: 'Used when logging soft errors. For example, if your request finished but returned a 404 not found' });

log.info({ label: 'functionName', message: 'General log messages about the state of the application' });

log.debug({ label: 'functionName', message: 'Useful for logging objects and other developer data', aJSONObjectToPrint, anotherObject);
or
log.debug({ label: 'functionName', message: 'Useful for logging objects and other developer data', someLabel: aJSONObjectToPrint, anotherObject });
```

Supported log properties:

```
- timestamp: overwrite the default time of `now` with your own timestamp.
- level: overwrite the default level (via log.<level>()) with your own level string.
- label: adds an additional label to the log message.
- message: a log message.
- <anyObject>: any additional object properties will be JSON.stringify'd and appended to the log message.
```

<br />

# Testing

## Technologies used

- [Mocha](https://www.npmjs.com/package/mocha) - Unit test framework
- [Chai](https://www.npmjs.com/package/chai) - Assertion library
- [SuperTest](https://www.npmjs.com/package/supertest) - API testing library
- [Nock](https://www.npmjs.com/package/nock) - HTTP mocking library

## Running Tests

- Run the unit tests

  ```
  npm test
  ```

- Run the unit tests in watch mode (will re-run the tests on code changes).

  ```
  npm run test:watch
  ```

- Run the unit test coverage report

  The coverage report will be output to `./coverage`

  ```
  npm run coverage
  ```

## Writing Tests

Any files that match `/src/**/*.@(test|spec).ts` will be considered tests.  
See [Mocha](https://mochajs.org) for documentation on writing tests.

<br />

# Keycloak

This project uses [Keycloak](https://www.keycloak.org/) to handle authentication.
