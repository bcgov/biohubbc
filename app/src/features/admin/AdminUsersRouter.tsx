import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import ManageUsersPage from './users/ManageUsersPage';
import UsersDetailPage from './users/UsersDetailPage';

/**
 * Router for all `/admin/users/*` pages.
 *
 * @return {*}
 */
const AdminUsersRouter: React.FC = () => {
  return (
    <Switch>
      <RouteWithTitle exact path="/admin/users" title={getTitle('Manage Users')}>
        <ManageUsersPage />
      </RouteWithTitle>

      <Route exact path="/admin/users/:id">
        <UsersDetailPage />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/users/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default AdminUsersRouter;
