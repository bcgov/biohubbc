declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to perform login action
         * @example cy.svcClientLogin()
         */
        svcClientLogin(): Chainable<Response>;

        /**
         * Custom command to perform logout action
         * @example cy.svcClientLogout()
         */
        svcClientLogout(): Chainable<Response>;

        /**
         * Custom command to set cookies
         * @example cy.svcClientSetCookie(tokens)
         */
        svcClientSetCookie(tokens: any): void;
    }
  }