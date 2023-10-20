import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import FundingSourcesListPage from './list/FundingSourcesListPage';

/**
 * Router for all `/admin/funding-sources/*` pages.
 *
 * @return {*}
 */
const FundingSourcesRouter: React.FC = () => {
  return (
    <Switch>
      <RouteWithTitle exact path="/admin/funding-sources" title={getTitle('Funding Sources')}>
        <FundingSourcesListPage />
      </RouteWithTitle>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/funding-sources/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default FundingSourcesRouter;
