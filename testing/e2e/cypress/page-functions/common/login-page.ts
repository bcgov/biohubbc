/// <reference types="cypress" />

export function navigate() {
  cy.visit('/')
}

export function login(userName,passWord) {
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  //Make sure we are on the app start page
  cy.get('[data-testid="login"]').should('be.visible')

  cy.get('[data-testid="login"]').click();

  // Make sure we are on the keycloak login page
  cy.get('#username').should('be.visible')

  cy.get('#username').clear();
  cy.get('#username').type(userName || username);

  cy.get('#password').clear();
  cy.get('#password').type(passWord || password);

  cy.get('#kc-login').click();

  cy.wait(5000);
  cy.get('h1').contains('Projects').should('be.visible')
}

export function logout() {
  cy.wait(5000);
  cy.get('a[data-testid="menu_log_out"]').click();
  cy.wait(1000);
}
