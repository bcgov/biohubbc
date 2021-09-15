import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PublicProjectsListPage from 'pages/public/PublicProjectsListPage';
import PublicProjectPage from 'pages/public/PublicProjectPage';
import PrivateRoute from 'utils/PrivateRoute';
import PublicLayout from 'layouts/PublicLayout';

interface IPublicProjectsRouterProps {
  classes: any;
}

/**
 * Router for all `/project/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PublicProjectsRouter: React.FC<IPublicProjectsRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        layout={PublicLayout}
        path="/projects"
        component={PublicProjectsListPage}
        componentProps={props}
      />

      <Redirect exact from="/projects/:id?" to="/projects/:id?/details" />
      <PrivateRoute
        exact
        layout={PublicLayout}
        path="/projects/:id?/details"
        component={PublicProjectPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/projects/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default PublicProjectsRouter;
