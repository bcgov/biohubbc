import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useConfigContext } from 'hooks/useContext';
import { PropsWithChildren, ReactElement, useContext } from 'react';
import { hasAtLeastOneValidValue } from 'utils/authUtils';

interface IGuardProps {
  /**
   * An optional backup ReactElement to render if the guard fails.
   *
   * @type {ReactElement}
   * @memberof IGuardProps
   */
  fallback?: ReactElement;
}

export interface ISystemRoleGuardProps extends IGuardProps {
  /**
   * An array of valid system roles. The user must have 1 or more matching system roles to pass the guard.
   *
   * @type {SYSTEM_ROLE[]}
   * @memberof ISystemRoleGuardProps
   */
  validSystemRoles: SYSTEM_ROLE[];
}

export interface IProjectRoleGuardProps extends IGuardProps {
  /**
   * An array of valid project roles. The user may have 1 or more matching project roles to pass the guard.
   *
   * @type {PROJECT_ROLE[]}
   * @memberof IProjectRoleGuardProps
   */
  validProjectRoles?: PROJECT_ROLE[];
  /**
   * An array of valid system roles. The user may have 1 or more matching system roles to override the guard.
   *
   * @type {SYSTEM_ROLE[]}
   * @memberof IProjectRoleGuardProps
   */
  validSystemRoles?: SYSTEM_ROLE[];

  /**
   * An array of valid project permissions. The user must have 1 or more matching permissions to pass the guard
   * @type {PROJECT_PERMISSION[]}
   * @memberof IProjectRoleGuardProps
   */
  validProjectPermissions: PROJECT_PERMISSION[];
}

export interface IFeatureFlagGuardProps extends IGuardProps {
  /**
   * An array of feature flag names.
   *
   * @type {string[]}
   * @memberof IFeatureFlagGuardProps
   */
  featureFlags: string[];
}

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles.
 *
 * @param {*} props
 * @return {*}
 */
export const SystemRoleGuard = (props: PropsWithChildren<ISystemRoleGuardProps>) => {
  const authStateContext = useAuthStateContext();
  const { validSystemRoles } = props;

  const hasSystemRole = hasAtLeastOneValidValue(validSystemRoles, authStateContext.simsUserWrapper.roleNames);

  if (!hasSystemRole) {
    if (props.fallback) {
      return <>{props.fallback}</>;
    }

    return <></>;
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user has the necessary roles as a project participant.
 *
 * @param {*} props
 * @return {*}
 */
export const ProjectRoleGuard = (props: PropsWithChildren<IProjectRoleGuardProps>) => {
  const { validProjectRoles, validSystemRoles, validProjectPermissions } = props;
  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  const hasSystemRole = projectAuthStateContext.hasSystemRole(validSystemRoles);
  const hasProjectRole = projectAuthStateContext.hasProjectRole(validProjectRoles);
  const hasProjectPermissions = projectAuthStateContext.hasProjectPermission(validProjectPermissions);

  if (hasSystemRole || hasProjectRole || hasProjectPermissions) {
    return <>{props.children}</>;
  }

  if (props.fallback) {
    return <>{props.fallback}</>;
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is authenticated.
 *
 * @param {*} props
 * @return {*}
 */
export const AuthGuard = (props: PropsWithChildren<IGuardProps>) => {
  const authStateContext = useAuthStateContext();

  if (!authStateContext.auth.isAuthenticated || authStateContext.simsUserWrapper.isLoading) {
    if (props.fallback) {
      return <>{props.fallback}</>;
    }

    return <></>;
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user is not authenticated.
 *
 * @param {*} props
 * @return {*}
 */
export const UnAuthGuard = (props: PropsWithChildren<IGuardProps>) => {
  const authStateContext = useAuthStateContext();

  if (authStateContext.auth.isAuthenticated) {
    if (props.fallback) {
      return <>{props.fallback}</>;
    }

    return <></>;
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if all specified feature flags do not exist.
 *
 * If at least one feature flag exists, the fallback will be rendered, or nothing if no fallback is provided.
 *
 * Feature flags are used to disable child components. to enabled a child component, simply remove all associated
 * feature flags from the config (via the `REACT_APP_FEATURE_FLAGS` env var).
 *
 * Note: Recommend conforming to a consistent pattern when defining feature flags, to make feature flags easy to
 * identify (ie: `[APP/API]_FF_<string>`)
 *
 * @param {*} props
 * @return {*}
 */
export const FeatureFlagGuard = (props: PropsWithChildren<IFeatureFlagGuardProps>) => {
  const config = useConfigContext();

  const matchingFeatureFlags = config.FEATURE_FLAGS.filter((featureFlag) => props.featureFlags.includes(featureFlag));

  if (matchingFeatureFlags.length) {
    // Found at least one matching feature flag, render the fallback or nothing if no fallback is provided.
    if (props.fallback) {
      return <>{props.fallback}</>;
    }

    return <></>;
  }

  // No matching feature flags found, render the children.
  return <>{props.children}</>;
};
