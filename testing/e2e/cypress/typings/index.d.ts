declare namespace Cypress {
    /**
     * Options accepted by the cypress-keycloak `login` command in `support/keycloak.js`.
     */
    interface KeycloakLoginOptions {
        root: string;
        realm: string;
        username: string;
        password: string;
        client_id: string;
        redirect_uri: string;
        path_prefix?: string;
    }

    /**
     * Options accepted by the cypress-keycloak `logout` command in `support/keycloak.js`.
     */
    interface KeycloakLogoutOptions {
        root: string;
        realm: string;
        redirect_uri: string;
        path_prefix?: string;
    }

    interface Chainable {
        /**
         * Custom command to perform login action.
         * `support/commands.ts` supplies the options from the Cypress environment.
         * @example cy.login()
         */
        login(options?: KeycloakLoginOptions): Chainable<Response>;

        /**
         * Custom command to perform logout action.
         * `support/commands.ts` supplies the options from the Cypress environment.
         * @example cy.logout()
         */
        logout(options?: KeycloakLogoutOptions): Chainable<Response>;
    }
  }
