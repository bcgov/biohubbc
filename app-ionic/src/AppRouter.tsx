import HomeRouter from 'features/home/HomeRouter';
import AuthLayout from 'layouts/AuthLayout';
import PublicLayout from 'layouts/PublicLayout';
import AccessDenied from 'pages/misc/AccessDenied';
import { NotFoundPage } from 'pages/misc/NotFoundPage';
import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import AppRoute from 'utils/AppRoute';

const AppRouter: React.FC = () => {
  const getTitle = (page: string) => {
    return `biohubbc - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <AppRoute
        path="/forbidden"
        title={getTitle('Forbidden')}
        component={AccessDenied}
        layout={PublicLayout}></AppRoute>
      <AppRoute
        path="/page-not-found"
        title={getTitle('Page Not Found')}
        component={NotFoundPage}
        layout={PublicLayout}></AppRoute>
      <AppRoute protected path="/home" component={HomeRouter} layout={AuthLayout} title={getTitle('Home')} />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;