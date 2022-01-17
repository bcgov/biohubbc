import {
  AuthenticatedRouteGuard,
  SystemRoleRouteGuard,
  UnAuthenticatedRouteGuard
} from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import AdminUsersRouter from 'features/admin/AdminUsersRouter';
import PermitsRouter from 'features/permits/PermitsRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import PublicProjectsRouter from 'features/projects/PublicProjectsRouter';
import ResourcesRouter from 'features/resources/ResourcesRouter';
import SearchPage from 'features/search/SearchPage';
import PublicLayout from 'layouts/PublicLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import LogOutPage from 'pages/logout/LogOutPage';
import React from 'react';
import { Redirect, Switch, useLocation } from 'react-router-dom';
import AppRoute from 'utils/AppRoute';

const AppRouter: React.FC = () => {
  const location = useLocation();

  const getTitle = (page: string) => {
    return `SIMS - ${page}`;
  };

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={{ ...location, pathname: location.pathname.slice(0, -1) }} />

      <Redirect exact from="/" to="/projects" />

      <AppRoute path="/projects" title={getTitle('Projects')} layout={PublicLayout}>
        <UnAuthenticatedRouteGuard>
          <PublicProjectsRouter />
        </UnAuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/search" title={getTitle('Search')} layout={PublicLayout}>
        <UnAuthenticatedRouteGuard>
          <SearchPage />
        </UnAuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/page-not-found" title={getTitle('Page Not Found')} layout={PublicLayout}>
        <NotFoundPage />
      </AppRoute>

      <AppRoute path="/forbidden" title={getTitle('Forbidden')} layout={PublicLayout}>
        <AccessDenied />
      </AppRoute>

      <AppRoute path="/access-request" title={getTitle('Access Request')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <AccessRequestPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/request-submitted" title={getTitle('Request submitted')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <RequestSubmitted />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <Redirect exact from="/admin" to="/admin/projects" />

      <AppRoute path="/admin/projects" title={getTitle('Projects')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <ProjectsRouter />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/users" title={getTitle('Users')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <AdminUsersRouter />
          </SystemRoleRouteGuard>
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/permits" title={getTitle('Permits')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <PermitsRouter />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/search" title={getTitle('Search')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <SearchPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/resources" title={getTitle('Resources')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <ResourcesRouter />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/logout" title={getTitle('Logout')} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <LogOutPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute title="*" path="*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default AppRouter;
