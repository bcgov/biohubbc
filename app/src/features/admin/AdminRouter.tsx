import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import AdminManagePage from './AdminManagePage';

/**
 * Router for all `/admin/manage/*` pages.
 *
 * @return {*}
 */
const AdminRouter: React.FC = () => {
  return (
    <Switch>
      <RouteWithTitle exact path="/admin/manage" title={getTitle('Manage')}>
        <AdminManagePage />
      </RouteWithTitle>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/manage/users/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default AdminRouter;
