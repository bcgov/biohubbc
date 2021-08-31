// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// Cypress.Commands.add("guiLogin", (user: string) => {
import createUUID from './createUUID';
import 'cypress-file-upload';

Cypress.Commands.add(
  'login',
  ({
    root,
    realm,
    username,
    password,
    client_id,
    redirect_uri,
    path_prefix = 'auth',
  }) =>
    cy
      .request({
        url: `${root}${path_prefix ? `/${path_prefix}` : ''
          }/realms/${realm}/protocol/openid-connect/auth`,
        qs: {
          client_id,
          redirect_uri,
          scope: 'openid',
          state: createUUID(),
          nonce: createUUID(),
          response_type: 'code',
          response_mode: 'fragment',
        },
      })
      .then((response) => {
        const html = document.createElement('html');
        html.innerHTML = response.body;

        const form = html.getElementsByTagName('form');
        const isAuthorized = !form.length;

        if (!isAuthorized)
          return cy.request({
            form: true,
            method: 'POST',
            url: form[0].action,
            followRedirect: false,
            body: {
              username,
              password,
            },
          });
      })
);

Cypress.Commands.add('logout', ({ root, realm, redirect_uri }) =>
  cy.request({
    qs: { redirect_uri },
    url: `${root}/auth/realms/${realm}/protocol/openid-connect/logout`,
  })
);
