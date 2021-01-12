# bcgov/biohubbc/app

A mixed online/offline React Ionic app for BioHub field activities.

## Documenation

Ionic React: https://ionicframework.com/docs/react  
Ionic React API: https://ionicframework.com/docs/api/route

React: https://reactjs.org/docs/getting-started.html

RJSF: https://react-jsonschema-form.readthedocs.io/en/latest/

## Run the app locally (web)

In the app directory:

```
npm install

ionic serve
```

## Run the app on mobile

### Android

On MacOS, Windows or Linux, in the app directory:

1. `npm install`
2. `ionic build`
3. `ionic cap add android` (Only the first time, does not need to be repeated after)
4. `ionic cap copy`
5. `ionic cap sync`
6. `npx cap open Android`

Android Studio will open and, after a short delay, will allow you to run the application in the simulator.

### IOS

On MacOS, in the app directory:

1. `npm install`
2. `ionic build`
3. `ionic cap add android` (Only the first time, does not need to be repeated after)
4. `ionic cap copy`
5. `ionic cap sync`
6. `npx cap open ios`

xCode will open and, after a short delay, will allow you to run the application in the simulator.

# Testing

## Technologies used

- [Jest](https://jestjs.io/docs/en/getting-started)

## Run Tests

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

## Writing Tests

Any files that match `/src/**/*.@(test|spec).ts` will be considered tests.  
See [Jest](https://jestjs.io/docs/en/getting-started) for documentation on writing tests.

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

There appears to be an issue between RJSF and react version 17+ that causes some of the RJSF form behaviour to work incorrectly. A result of some change to how events are bubbled up, introduced in react 17.x. Recommend keeping react at the latest 16.x version.

- https://github.com/rjsf-team/react-jsonschema-form/issues/2104
