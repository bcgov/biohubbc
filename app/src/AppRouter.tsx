import {
  AuthenticatedRouteGuard,
  SystemRoleRouteGuard,
  UnAuthenticatedRouteGuard
} from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import AdminUsersRouter from 'features/admin/AdminUsersRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import ResourcesPage from 'features/resources/ResourcesPage';
import SearchPage from 'features/search/SearchPage';
import BaseLayout from 'layouts/BaseLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import { LandingPage } from 'pages/landing/LandingPage';
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

      <AppRoute path="/page-not-found" title={getTitle('Page Not Found')} layout={BaseLayout}>
        <NotFoundPage />
      </AppRoute>

      <AppRoute path="/forbidden" title={getTitle('Forbidden')} layout={BaseLayout}>
        <AccessDenied />
      </AppRoute>

      <AppRoute path="/access-request" title={getTitle('Access Request')} layout={BaseLayout}>
        <AccessRequestPage />
      </AppRoute>

      <AppRoute path="/request-submitted" title={getTitle('Request submitted')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <RequestSubmitted />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <Redirect exact from="/admin" to="/admin/projects" />

      <AppRoute path="/admin/projects" title={getTitle('Projects')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <ProjectsRouter />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/users" title={getTitle('Users')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <AdminUsersRouter />
          </SystemRoleRouteGuard>
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/templates" title={getTitle('Users')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <AdminUsersRouter />
          </SystemRoleRouteGuard>
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/search" title={getTitle('Search')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <SearchPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/admin/resources" title={getTitle('Resources')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <ResourcesPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/logout" title={getTitle('Logout')} layout={BaseLayout}>
        <AuthenticatedRouteGuard>
          <LogOutPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute title="*" path="*">
        <UnAuthenticatedRouteGuard>
          <LandingPage originalPath={''} />
        </UnAuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute title="*" path="*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default AppRouter;
