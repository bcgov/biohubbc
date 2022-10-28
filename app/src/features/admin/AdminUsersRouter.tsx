import AdminUsersLayout from 'features/admin/AdminUsersLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import ManageUsersPage from './users/ManageUsersPage';
import UsersDetailPage from './users/UsersDetailPage';

/**
 * Router for all `/admin/users/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersRouter: React.FC = (props) => {
  return (
    <Switch>
      <AppRoute exact path="/admin/users" layout={AdminUsersLayout}>
        <ManageUsersPage />
      </AppRoute>

      <AppRoute exact path="/admin/users/:id" layout={AdminUsersLayout}>
        <UsersDetailPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/users/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default AdminUsersRouter;
