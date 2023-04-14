import AdminUsersLayout from 'features/admin/AdminUsersLayout';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import ManageUsersPage from './users/ManageUsersPage';
import UsersDetailPage from './users/UsersDetailPage';
import { getTitle } from 'utils/Utils';

/**
 * Router for all `/admin/users/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersRouter: React.FC = (props) => {
  return (
    <Switch>
      <RouteWithTitle exact path="/admin/users" title={getTitle('Manage Users')}>
        <AdminUsersLayout>
          <ManageUsersPage />
        </AdminUsersLayout>
      </RouteWithTitle>

      <Route exact path="/admin/users/:id">
        <AdminUsersLayout>
          <UsersDetailPage />
        </AdminUsersLayout>
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/users/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default AdminUsersRouter;
