import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { ProjectParticipantGuardContext } from 'contexts/projectParticipantGuardContext';
import React, { ReactElement, useContext } from 'react';
import { isAuthenticated } from 'utils/authUtils';

interface IGuardProps {
  /**
   * An optional backup ReactElement to render if the guard fails.
   *
   * @type {ReactElement}
   * @memberof IGuardProps
   */
  fallback?: ReactElement;
}

export interface ISystemRoleGuardProps {
  /**
   * An array of valid system roles. The user must have 1 or more matching system roles to pass the guard.
   *
   * @type {SYSTEM_ROLE[]}
   * @memberof ISystemRoleGuardProps
   */
  validSystemRoles: SYSTEM_ROLE[];
}

export interface IProjectParticipantGuardProps {
  /**
   * An array of valid project roles. The user must have 1 or more matching project roles to pass the guard.
   *
   * @type {PROJECT_ROLE[]}
   * @memberof IProjectParticipantGuardProps
   */
  validProjectRoles: PROJECT_ROLE[];
}


/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles.
 *
 * @param {*} props
 * @return {*}
 */
export const SystemRoleGuard: React.FC<ISystemRoleGuardProps & IGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const { validSystemRoles } = props;
  const hasSystemRole = keycloakWrapper?.hasSystemRole(validSystemRoles);

  if (!hasSystemRole) {
    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user has the necessary roles as a project participant.
 *
 * @param {*} props
 * @return {*}
 */
export const ProjectRoleGuard: React.FC<IProjectParticipantGuardProps & IGuardProps> = (props) => {
  const { validProjectRoles } = props
  const { participant, projectId } = useContext(ProjectParticipantGuardContext);
  
  const hasProjectRole = participant
    && participant.project_id === projectId
    && participant.project_role_names.some((roleName) => validProjectRoles.includes(roleName));

  if (!hasProjectRole) {
    console.log('User does not have role:', validProjectRoles);
    console.log({ participant });

    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user is authenticated.
 *
 * @param {*} props
 * @return {*}
 */
export const AuthGuard: React.FC<IGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!isAuthenticated(keycloakWrapper)) {
    // Use is not logged in
    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user is not authenticated.
 *
 * @param {*} props
 * @return {*}
 */
export const UnAuthGuard: React.FC<IGuardProps> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (isAuthenticated(keycloakWrapper)) {
    // Use is not logged in
    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  return <>{props.children}</>;
};
