import { SYSTEM_ROLE } from 'constants/roles';
import AdminRouter from 'features/admin/AdminRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import PublicLayout from 'layouts/PublicLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import LogInPage from 'pages/login/LogInPage';
import LogOutPage from 'pages/logout/LogOutPage';
import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import AppRoute from 'utils/AppRoute';
import SearchPage from 'features/search/SearchPage';

const AppRouter: React.FC = (props: any) => {
  const getTitle = (page: string) => {
    return `BioHub - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/" to="/login" />
      <AppRoute path="/login" title={getTitle('Login')} component={LogInPage} layout={PublicLayout} />
      <AppRoute
        path="/page-not-found"
        title={getTitle('Page Not Found')}
        component={NotFoundPage}
        layout={PublicLayout}
      />
      <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={PublicLayout} />

      <AppRoute
        protected
        path="/access-request"
        title={getTitle('Access Request')}
        component={AccessRequestPage}
        layout={PublicLayout}
      />
      <AppRoute
        protected
        path="/request-submitted"
        component={RequestSubmitted}
        layout={PublicLayout}
        title={getTitle('Request submitted')}
      />
      <AppRoute
        protected
        path="/projects"
        component={ProjectsRouter}
        layout={PublicLayout}
        title={getTitle('Projects')}
        validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]}
      />
      <AppRoute
        protected
        path="/admin"
        component={AdminRouter}
        layout={PublicLayout}
        title={getTitle('Admin')}
        validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
      />
      <AppRoute
        protected
        path="/search"
        component={SearchPage}
        layout={PublicLayout}
        title={getTitle('Search')}
        validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]}
      />
      <AppRoute protected path="/logout" component={LogOutPage} layout={PublicLayout} title={getTitle('Logout')} />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
