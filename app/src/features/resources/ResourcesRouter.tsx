//import CreatePermitPage from 'features/permits/CreatePermitPage';
import PermitsLayout from 'features/permits/PermitsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ResourcesPage from './ResourcesPage';

interface IPermitsRouterProps {
  classes: any;
}

/**
 * Router for all `/permit/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const ResourcesRouter: React.FC<IPermitsRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute exact layout={PermitsLayout} path="/admin/resources" component={ResourcesPage} componentProps={props} />
      {/* <PrivateRoute
        exact
        layout={PermitsLayout}
        path="/admin/permits/create"
        component={CreatePermitPage}
        componentProps={props}
      /> */}
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/admin/resources/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default ResourcesRouter;
