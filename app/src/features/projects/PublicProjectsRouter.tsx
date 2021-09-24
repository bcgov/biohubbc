import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PublicProjectsListPage from 'pages/public/PublicProjectsListPage';
import PublicProjectPage from 'pages/public/PublicProjectPage';
import PublicLayout from 'layouts/PublicLayout';

interface IPublicProjectsRouterProps {
  classes: any;
}

/**
 * Router for all `/projects/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PublicProjectsRouter: React.FC<IPublicProjectsRouterProps> = (props) => {
  return (
    <Switch>
      <AppRoute exact layout={PublicLayout} path="/projects" component={PublicProjectsListPage} title="Projects" />

      <Redirect exact from="/projects/:id?" to="/projects/:id?/details" />
      <AppRoute
        exact
        layout={PublicLayout}
        path="/projects/:id?/details"
        component={PublicProjectPage}
        title="Projects"
      />
      <AppRoute
        exact
        layout={PublicLayout}
        path="/projects/:id?/attachments"
        component={PublicProjectPage}
        title="Projects"
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/projects/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default PublicProjectsRouter;
