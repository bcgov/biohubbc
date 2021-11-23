import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { ReactElement, useContext } from 'react';
import { isAuthenticated } from 'utils/authUtils';

export interface ISystemRoleGuardProps {
  validSystemRoles: SYSTEM_ROLE[];
}

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles.
 *
 * @param {*} props
 * @return {*}
 */
export const SystemRoleGuard: React.FC<ISystemRoleGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const hasSystemRole = keycloakWrapper?.hasSystemRole(props.validSystemRoles);

  if (!hasSystemRole) {
    return <></>;
  }

  return props.children as ReactElement;
};

/**
 * Renders `props.children` only if the user is authenticated.
 *
 * @param {*} props
 * @return {*}
 */
export const AuthGuard: React.FC = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!isAuthenticated(keycloakWrapper)) {
    // Use is not logged in
    return <></>;
  }

  return props.children as ReactElement;
};

/**
 * Renders `props.children` only if the user is not authenticated.
 *
 * @param {*} props
 * @return {*}
 */
export const UnAuthGuard: React.FC = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (isAuthenticated(keycloakWrapper)) {
    // Use is not logged in
    return <></>;
  }

  return props.children as ReactElement;
};
