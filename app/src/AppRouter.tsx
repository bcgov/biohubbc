import { AuthenticatedRouteGuard, SystemRoleRouteGuard } from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContextProvider } from 'contexts/codesContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import AdminRouter from 'features/admin/AdminRouter';
import FundingSourcesRouter from 'features/funding-sources/FundingSourcesRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import ResourcesPage from 'features/resources/ResourcesPage';
import StandardsPage from 'features/standards/StandardsPage';
import SummaryRouter from 'features/summary/SummaryRouter';
import BaseLayout from 'layouts/BaseLayout';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import RequestSubmitted from 'pages/access/RequestSubmitted';
import { LandingPage } from 'pages/landing/LandingPage';
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
          <AuthenticatedRouteGuard>
            <DialogContextProvider>
              <AccessRequestPage />
            </DialogContextProvider>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/request-submitted" title={getTitle('Request submitted')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <RequestSubmitted />
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <Redirect exact from="/admin" to="/admin/summary" />

      <RouteWithTitle path="/admin/summary" title={getTitle('Summary')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <CodesContextProvider>
              <SummaryRouter />
            </CodesContextProvider>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/admin/projects" title={getTitle('Projects')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <CodesContextProvider>
              <ProjectsRouter />
            </CodesContextProvider>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/admin/manage" title={getTitle('Users')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
              <DialogContextProvider>
                <CodesContextProvider>
                  <AdminRouter />
                </CodesContextProvider>
              </DialogContextProvider>
            </SystemRoleRouteGuard>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/admin/funding-sources" title={getTitle('Funding Sources')}>
        <BaseLayout>
          <AuthenticatedRouteGuard>
            <SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <DialogContextProvider>
                <CodesContextProvider>
                  <FundingSourcesRouter />
                </CodesContextProvider>
              </DialogContextProvider>
            </SystemRoleRouteGuard>
          </AuthenticatedRouteGuard>
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/resources" title={getTitle('Resources')}>
        <BaseLayout>
          <ResourcesPage />
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle path="/standards" title={getTitle('Standards')}>
        <BaseLayout>
          <StandardsPage />
        </BaseLayout>
      </RouteWithTitle>

      <RouteWithTitle title={getTitle()} path="/">
        <LandingPage />
      </RouteWithTitle>

      <RouteWithTitle title={getTitle()} path="*">
        <Redirect to="/page-not-found" />
      </RouteWithTitle>
    </Switch>
  );
};

export default AppRouter;
