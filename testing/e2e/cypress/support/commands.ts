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
Cypress.Commands.add('svcClientLogin', () => {
  Cypress.log({ name: 'KeyCloak Login' });
  const authBaseUrl = Cypress.env('authUrl');
  const realm = Cypress.env('authRealm');
  const client_id = Cypress.env('authClientId');
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  return cy
    .request({
      method: 'POST',
      url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/token`,
      followRedirect: false,
      form: true,
      body: {
        grant_type: 'password',
        client_id,
        scope: 'openid',
        username,
        password,
      },
    })
    .its('body');
});

Cypress.Commands.add('svcClientLogout', () => {
  Cypress.log({ name: 'KeyCloak Logout' });
  const authBaseUrl = Cypress.env('authUrl');
  const realm = Cypress.env('authRealm');

  return cy.request({
    url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/logout`,
  });
});

Cypress.Commands.add('svcClientSetCookie', (tokens: any) => {
  Cypress.log({ name: 'Set Application Cookie' });
  const baseUrl = new URL(Cypress.config('baseUrl'));
  const cookieDomain = baseUrl.hostname;
  const cookieOptions = { log: true, domain: cookieDomain };

  function getExpiryUTC(expires_in) {
    let tokenExpiryPOSIX = Date.now() + expires_in * 1000;
    let expiryDate = new Date(tokenExpiryPOSIX);
    return expiryDate.toUTCString();
  }

  const accessTokenExpiry = getExpiryUTC(tokens.expires_in);
  const refreshTokenExpiry = getExpiryUTC(tokens.refresh_expires_in);
  cy.setCookie('accessToken', tokens.access_token, cookieOptions);
  cy.setCookie('refreshToken', tokens.refresh_token, cookieOptions);
  cy.setCookie('accessTokenExpiery', accessTokenExpiry, cookieOptions);
  cy.setCookie('refreshTokenExpiery', refreshTokenExpiry, cookieOptions);
});
