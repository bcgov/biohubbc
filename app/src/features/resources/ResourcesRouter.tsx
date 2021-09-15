import ResourcesLayout from 'features/resources/ResourcesLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ResourcesPage from './ResourcesPage';

interface IResourcesRouterProps {
  classes: any;
}

/**
 * Router for all `/admin/resources/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const ResourcesRouter: React.FC<IResourcesRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        layout={ResourcesLayout}
        path="/admin/resources"
        component={ResourcesPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/admin/resources/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default ResourcesRouter;
