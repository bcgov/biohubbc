import 'cypress-keycloak';

describe('KeyCloak Login', () => {
  const authBaseUrl = Cypress.env('authUrl');
  const realm = Cypress.env('authRealm');
  const client_id = Cypress.env('authClientId');
  const username = Cypress.env('username');
  const password = Cypress.env('password');
  const host = Cypress.env('host');

  it('Redirects to project on successful login', () => {
    cy.login({
      root: authBaseUrl,
      realm: realm,
      username: username,
      password: password,
      client_id: client_id,
      redirect_uri: host
    });
    cy.visit('/');
  });
});
