import { SystemRoleRouteGuard } from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import CreateCollectionPage from './create/CreateCollectionPage';
import CollectionPage from './details/CollectionPage';
import EditCollectionPage from './edit/EditCollectionPage';

/**
 * Router for all `/admin/collections/*` pages.
 *
 * @return {*}
 */
const CollectionsRouter = () => {
  return (
    <Switch>
      {/* Summary Page Redirect */}
      <RouteWithTitle exact path="/admin/collections" title={getTitle('Collections')}>
        <Redirect to="/admin/summary" />
      </RouteWithTitle>

      {/* Create Collection Route */}
      <RouteWithTitle exact path="/admin/collections/create" title={getTitle('Create Collection')}>
        <DialogContextProvider>
          <SystemRoleRouteGuard
            validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR]}>
            <CreateCollectionPage />
          </SystemRoleRouteGuard>
        </DialogContextProvider>
      </RouteWithTitle>

      <Redirect exact from="/admin/collections/:id" to="/admin/collections/:id/details" />

      {/* Collection Route */}
      <RouteWithTitle exact path="/admin/collections/:id/details" title={getTitle('Collection')}>
        <DialogContextProvider>
          <TaxonomyContextProvider>
            <SystemRoleRouteGuard
              validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR]}>
              <CollectionPage />
            </SystemRoleRouteGuard>
          </TaxonomyContextProvider>
        </DialogContextProvider>
      </RouteWithTitle>

      {/* Collection Edit Page Route */}
      <RouteWithTitle exact path="/admin/collections/:id/edit" title={getTitle('Edit Collection')}>
        <DialogContextProvider>
          <TaxonomyContextProvider>
            <SystemRoleRouteGuard
              validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR]}>
              <EditCollectionPage />
            </SystemRoleRouteGuard>
          </TaxonomyContextProvider>
        </DialogContextProvider>
      </RouteWithTitle>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/collections/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default CollectionsRouter;
