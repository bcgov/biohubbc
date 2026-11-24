// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import "cypress-file-upload";
import "./keycloak.js"

Cypress.Commands.overwrite('login', (originalFn) => {
  cy.env(['authUrl', 'authRealm', 'username', 'password', 'authClientId', 'host'], { log: false }).then((env) => {
    originalFn({
      root: env.authUrl,
      realm: env.authRealm,
      username: env.username,
      password: env.password,
      client_id: env.authClientId,
      redirect_uri: env.host,
    })
  })
})

Cypress.Commands.overwrite('logout', (originalFn) => {
  cy.env(['authUrl', 'authRealm', 'host'], { log: false }).then((env) => {
    originalFn({
      root: env.authUrl,
      realm: env.authRealm,
      redirect_uri: env.host,
    })
  })
})
