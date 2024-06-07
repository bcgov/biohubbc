import { DialogContextProvider } from 'contexts/dialogContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import SummaryPage from './SummaryPage';

/**
 * Router for all `/admin/summary/*` pages.
 *
 * @return {*}
 */
const SummaryRouter: React.FC = () => {
  return (
    <Switch>
      {/* Summary Routes */}
      <RouteWithTitle exact path="/admin/summary" title={getTitle('Summary')}>
        <DialogContextProvider>
          <TaxonomyContextProvider>
            <SummaryPage />
          </TaxonomyContextProvider>
        </DialogContextProvider>
      </RouteWithTitle>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/summary/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default SummaryRouter;
