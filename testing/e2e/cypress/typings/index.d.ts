declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to perform login action
         * @example cy.svcClientLogin()
         */
        login(): Chainable<Response>;

        /**
         * Custom command to perform logout action
         * @example cy.svcClientLogout()
         */
        logout(): Chainable<Response>;
    }
  }
