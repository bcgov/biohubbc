import CreatePermitPage from 'features/permits/CreatePermitPage';
import PermitsLayout from 'features/permits/PermitsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PermitsPage from './PermitsPage';

/**
 * Router for all `/admin/permits/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PermitsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/admin/permits" layout={PermitsLayout}>
        <PermitsPage />
      </AppRoute>

      <AppRoute exact path="/admin/permits/create" layout={PermitsLayout}>
        <CreatePermitPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/permits/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default PermitsRouter;
