import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import FundingSourcesLayout from './FundingSourcesLayout';
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
        <FundingSourcesLayout>
          <FundingSourcesListPage />
        </FundingSourcesLayout>
      </RouteWithTitle>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/funding-sources/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default FundingSourcesRouter;
