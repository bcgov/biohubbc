# bcgov/biohubbc/app

A standard React web-app for BioHub management activities.

## Documenation

React: https://reactjs.org/docs/getting-started.html

RJSF: https://react-jsonschema-form.readthedocs.io/en/latest/

# Testing

## Technologies used

- [Jest](https://jestjs.io/docs/en/getting-started)

## Running Tests

- Run the unit tests

  ```
  npm run test
  ```

- Run the unit tests in watch mode (will re-run the tests on code changes).

  ```
  npm run test:watch
  ```

- Run the unit test coverage report

  ```
  npm run coverage
  ```

- Generate new snapshots

  See [Snapshot Tests](#snapshot-tests) for details

  ```
  npm run update-snapshots
  ```

## Writing Tests

Any files that match `/src/**/*.@(test|spec).ts` will be considered tests.

### Unit Tests

Tests that assert a function, given some input, returns an expected output.

_Note: These only apply if the function in question has NO react concepts (it is a pure function). If a function contains react conceps (state, hooks, etc) it will need to be tested in a [Dom Tests](#dom-tests) style, which has mechanisms to account for the rendering lifecycle, etc._

#### Useful Documentation

- https://jestjs.io/docs/en/getting-started

### React Tests

Tests that simulate the user experience, and make assertions about the state of the page and related variables.

#### Useful Documentation

- https://testing-library.com/docs/

#### Relevant Sample Projects

- https://github.com/bcgov/PIMS
  - SplReportContainer.test.tsx
  - useRouterFilter.test.tsx
  - LayersControl.test.tsx
  - etc...

### Snapshot Tests

_Note: Snapshot tests are not useful in all situations, and should really only be used for components that are stable and unlikely to change much. For example: asserting the content of a footer bar._

Snapshot tests are a special kind of jest test that asserts that a previously saved copy of the rendered component matches the current version of the rendered component.

These tests assert that the rendered UI of the component is correct, under whatever pre-conditions are set up in the test.

These tests are run just like any other tests, but have 1 additional pre-requisite, which is generating the initial snapshot of the component. See [Running Tests](#running-tests).

The snapshot files produced should be saved in the repo.

<br />

# Nice To Know

## Environment Variables

- With the exception of `NODE_ENV`, any environment variable that needs to be accessible by the react app (via `process.env.<var>`) must be prefixed with `REACT_APP_`. If it is not prefixed, react will not read it, and it will be `undefined` when you try to access it.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables

## .env

- React will read a `.env` or similar file by default, and will read any variables prefixed with `REACT_APP_`.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used

# Troubleshooting and Known Issues

### `react` version

There appears to be an issue between RJSF and react version 17+ that causes some of the RJSF form behaviour to work incorrectly. A result of some change to how events are bubbled up, introduced in react `17.x`.

- The simplest solution for now is to keep react at the latest `16.x` version.

- https://github.com/rjsf-team/react-jsonschema-form/issues/2104

### `typescript` version

There is a known issue between typescript `4.x` and `eslint` that can result in the following error when running the linter, via: `npm run lint`

The simplest solution for now is to keep typescript at the latest `3.x` version.

- There is some discussion here (among other places):  
  https://stackoverflow.com/questions/62079477/line-0-parsing-error-cannot-read-property-map-of-undefined/63660413

```
0:0 error Parsing error: Cannot read property 'map' of undefined
```
