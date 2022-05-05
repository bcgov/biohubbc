import PublicProjectPage from 'pages/public/PublicProjectPage';
import PublicProjectsListPage from 'pages/public/PublicProjectsListPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';

/**
 * Router for all `/projects/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PublicProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/projects">
        <PublicProjectsListPage />
      </AppRoute>

      <Redirect exact from="/projects/:id" to="/projects/:id/details" />

      <AppRoute exact path="/projects/:id/details">
        <PublicProjectPage />
      </AppRoute>

      <AppRoute exact path="/projects/:id/attachments">
        <PublicProjectPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default PublicProjectsRouter;
