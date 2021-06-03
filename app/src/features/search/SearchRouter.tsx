import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ObservationsSearchPage from './observations/ObservationsSearchPage';
import SearchLayout from './SearchLayout';

interface ISearchRouterProps {
  classes: any;
}

/**
 * Router for all `/search/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const SearchRouter: React.FC<ISearchRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        layout={SearchLayout}
        path="/search/observations"
        component={ObservationsSearchPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/search/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default SearchRouter;
