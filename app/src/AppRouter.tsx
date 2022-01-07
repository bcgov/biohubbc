import { SYSTEM_ROLE } from 'constants/roles';
import AdminUsersRouter from 'features/admin/AdminUsersRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import PublicLayout from 'layouts/PublicLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import LogOutPage from 'pages/logout/LogOutPage';
import React from 'react';
import { Redirect, Switch, useLocation } from 'react-router-dom';
import AppRoute from 'utils/AppRoute';
import PermitsRouter from 'features/permits/PermitsRouter';
import PublicProjectsRouter from 'features/projects/PublicProjectsRouter';

const AppRouter: React.FC = (props: any) => {
  const location = useLocation();

  const getTitle = (page: string) => {
    return `Restoration-Tracker - ${page}`;
  };

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={location.pathname.slice(0, -1)} />
      <Redirect exact from="/" to="/projects" />
      <AppRoute path="/projects" title={getTitle('Projects')} component={PublicProjectsRouter} />
      <AppRoute
        anyAuth
        path="/page-not-found"
        title={getTitle('Page Not Found')}
        component={NotFoundPage}
        layout={PublicLayout}
      />
      <AppRoute
        anyAuth
        path="/forbidden"
        title={getTitle('Forbidden')}
        component={AccessDenied}
        layout={PublicLayout}
      />

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
        path="/admin/projects"
        component={ProjectsRouter}
        layout={PublicLayout}
        title={getTitle('Projects')}
      />
      <AppRoute
        protected
        path="/admin/users"
        component={AdminUsersRouter}
        layout={PublicLayout}
        title={getTitle('Users')}
        validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
      />
      <AppRoute
        protected
        path="/admin/permits"
        component={PermitsRouter}
        layout={PublicLayout}
        title={getTitle('Permits')}
      />
      <AppRoute protected path="/logout" component={LogOutPage} layout={PublicLayout} title={getTitle('Logout')} />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
