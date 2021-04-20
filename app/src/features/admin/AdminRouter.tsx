import AdminLayout from 'features/admin/AdminLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ManageUsersPage from './users/ManageUsersPage';

interface IAdminRouterProps {
  classes: any;
}

/**
 * Router for all `/admin/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminRouter: React.FC<IAdminRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute exact layout={AdminLayout} path="/admin/users" component={ManageUsersPage} componentProps={props} />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/admin/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AdminRouter;
