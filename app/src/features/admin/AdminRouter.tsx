import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import AdminManagePage from './AdminManagePage';
import UsersDetailPage from './users/projects/UsersDetailPage';

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

      <Route exact path="/admin/manage/users/:id">
        <UsersDetailPage />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/manage/users/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default AdminRouter;
