# bcgov/biohubbc/api

## Technologies Used

| Technology | Version | Website                | Description          |
| ---------- | ------- | ---------------------- | -------------------- |
| node       | 18.x.x  | https://nodejs.org/en/ | JavaScript Runtime   |
| npm        | 10.x.x  | https://www.npmjs.com/ | Node Package Manager |

<br />

# API Specification

The root API schema is defined in `./src/openapi/root-api-doc.ts`.

If this project is running in docker you can view the beautified api docs at: `http://localhost:6100/api-docs/`.

- The raw api-docs are available at: `http://localhost:6100/raw-api-docs/`.

This project uses npm package `express-openapi` via `./app.ts` to automatically generate the express server and its routes, based on the contents of the `./src/openapi/root-api-doc.ts` and the `./src/path/*` content.

- The endpoint paths are defined based on the folder structure of the `./src/paths/` folder.
  - Example: `<host>/api/activity` is handled by `./src/paths/activity.ts`
  - Example: `<host>/api/activity/23 ` is handled by `./src/paths/activity/{activityId}.ts`

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

## Linting and Formatting

### Run the Linter and Formatter

```
npm run lint
npm run format
```

### Run the Linter and Formatter in Fix mode (will attempt to automatically fix issues)

_Note: In the worst case scenario, where linting/formatting has been neglected, then these `lint-fix` commands have the potential to create 100's of file changes. In this case, it is recommended to only run these commands as part of a separate commit._

_Note: Not all linting/formatting errors can be automatically fixed, and some will require human intervention._

```
npm run lint-fix
npm run format-fix
```

For convenience, you can also both lint-fix and format-fix in one command.

```
npm run fix
```

<br />

# Logging

A centralized logger has been created (see `api/utils/logger.ts`).

## Logger configuration

The loggers log level can be configured via an environment variable: `LOG_LEVEL`

Set this variable to one of: `silent`, `error`, `warn`, `info`, `debug`, `silly`

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

log.debug({ label: 'functionName', message: 'Useful for logging objects and other developer data', someLabel: aJSONObjectToPrint, anotherObject });
```

<br />

# Testing

## Technologies used

- [Mocha](https://www.npmjs.com/package/mocha) - Unit test framework
- [Chai](https://www.npmjs.com/package/chai) - Assertion library

## Running Tests

- Run the unit tests

  ```
  npm test
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

# Troubleshooting and Known Issues
