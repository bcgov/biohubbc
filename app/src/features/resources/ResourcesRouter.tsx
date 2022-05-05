import ResourcesLayout from 'features/resources/ResourcesLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import ResourcesPage from './ResourcesPage';

/**
 * Router for all `/admin/resources/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const ResourcesRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact layout={ResourcesLayout} path="/admin/resources">
        <ResourcesPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/resources/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default ResourcesRouter;
