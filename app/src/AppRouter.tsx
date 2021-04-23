import AdminRouter from 'features/admin/AdminRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import AuthLayout from 'layouts/AuthLayout';
import PublicLayout from 'layouts/PublicLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import AppRoute from 'utils/AppRoute';

const AppRouter: React.FC = () => {
  const getTitle = (page: string) => {
    return `BioHub - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/" to="/projects" />
      <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={AuthLayout}></AppRoute>
      <AppRoute
        path="/access-request"
        title={getTitle('Access Request')}
        component={AccessRequestPage}
        layout={PublicLayout}></AppRoute>
      <AppRoute
        path="/page-not-found"
        title={getTitle('Page Not Found')}
        component={NotFoundPage}
        layout={PublicLayout}></AppRoute>
      <AppRoute
        protected
        path="/projects"
        component={ProjectsRouter}
        layout={AuthLayout}
        title={getTitle('Projects')}
        validRoles={['abc']}
      />
      <AppRoute
        protected
        path="/request-submitted"
        component={RequestSubmitted}
        layout={AuthLayout}
        title={getTitle('Request submitted')}
      />
      <AppRoute protected path="/admin" component={AdminRouter} layout={AuthLayout} title={getTitle('Admin')} />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
