import { SystemUser } from '../repositories/user-repository';
import { AuthorizationScheme } from '../services/authorization-service';
import { KeycloakUserInformation } from '../utils/keycloak-utils';

/**
 * Extended Express Request.
 *
 * Note: Additional properties are populated during different stages of request.
 *
 * @see utils/request.ts - Request getter functions for extended properties
 *
 */
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Keycloak user JWT token object.
     *
     * Value is defined for endpoints that specify `Bearer` security with correct JWT token.
     *
     * @see authentication.ts -> authenticateRequest()
     *
     */
    keycloak_token?: KeycloakUserInformation;

    /**
     * SIMS system user details object.
     *
     * Value is defined for endpoints that authorize a user successfully against `AuthorizationScheme`.
     *
     * @see authorization.ts -> authorizeRequest()
     *
     */
    system_user?: SystemUser;

    /**
     * Authorization Scheme object.
     *
     * Value is defined for endpoints with Authorization.
     *
     * @see authorization.ts -> authorizeRequestHandler()
     *
     */
    authorization_scheme?: AuthorizationScheme;
  }
}
