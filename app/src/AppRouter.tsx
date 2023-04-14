import {
  AuthenticatedRouteGuard,
  SystemRoleRouteGuard,
  UnAuthenticatedRouteGuard
} from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContextProvider } from 'contexts/codesContext';
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
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';

const AppRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={{ ...location, pathname: location.pathname.slice(0, -1) }} />

      <RouteWithTitle path="/page-not-found" title={getTitle('Page Not Found')}>
        <BaseLayout>
          <NotFoundPage />
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/forbidden" title={getTitle('Forbidden')}>
        <BaseLayout>
          <AccessDenied />
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/access-request" title={getTitle('Access Request')}>
        <BaseLayout>
          <AccessRequestPage />
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/request-submitted" title={getTitle('Request submitted')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <RequestSubmitted />
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <Redirect exact from="/admin" to="/admin/projects" />

      <RouteWithTitle path="/admin/projects" title={getTitle('Projects')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <CodesContextProvider>
              <ProjectsRouter />
            </CodesContextProvider>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/admin/users" title={getTitle('Users')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <AdminUsersRouter />
            </SystemRoleRouteGuard>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/admin/search" title={getTitle('Search')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <SearchPage />
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/admin/resources" title={getTitle('Resources')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <ResourcesPage />
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/logout" title={getTitle('Logout')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <LogOutPage />
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle title={getTitle()} path="*">
        <UnAuthenticatedRouteGuard>
          <LandingPage originalPath={''} />
        </UnAuthenticatedRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle title={getTitle()} path="*">
        <Redirect to="/page-not-found" />
      </RouteWithTitle>
    </Switch>
  );
};

export default AppRouter;
