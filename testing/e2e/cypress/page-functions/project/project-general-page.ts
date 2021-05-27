<reference types="cypress" />

export function navigate() {
  cy.visit('http://todomvc-app-for-testing.surge.sh/')
}
