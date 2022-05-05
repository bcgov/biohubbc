# End-to-End testing using [Cypress.io](https://www.cypress.io/)

### Application Setup

Customize the credentials for your application.

- copy [sample.cypress.env.json](./sample.cypress.env.json) to `cypress.env.json`
- edit `cypress.env.json`, setting the variable values, including: username, password, host, baseUrl, authRealm, authClientId, authUrl

```bash
npm run cypress
```

## Setup of KeyCloak

In order to provide log in services through Keycloak (as opposed to navigating the UI to login, which cannot be done in a test script as it needs to address multiple domains), we found the [cypress-keycloak module](https://www.npmjs.com/package/cypress-keycloak). This module reports incompatibility with our current Cypress version, so a rebuilt of the [code](https://github.com/babangsund/cypress-keycloak) with the dependencies updated resulted in a keycloak.js file that has been added to the support files.
