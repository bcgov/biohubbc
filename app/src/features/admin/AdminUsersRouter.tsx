import AdminUsersLayout from 'features/admin/AdminUsersLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ManageUsersPage from './users/ManageUsersPage';
import UsersDetailPage from './users/UsersDetailPage';

interface IAdminUsersRouterProps {
  classes: any;
}

/**
 * Router for all `/admin/users*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersRouter: React.FC<IAdminUsersRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        layout={AdminUsersLayout}
        path="/admin/users"
        component={ManageUsersPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={AdminUsersLayout}
        path="/admin/users/:id"
        component={UsersDetailPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/admin/users/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AdminUsersRouter;
