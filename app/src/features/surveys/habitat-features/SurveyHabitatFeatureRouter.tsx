import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import { HabitatFeatureTableContextProvider } from 'contexts/habitatFeatureTableContext';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { SurveyHabitatFeaturePage } from './SurveyHabitatFeaturePage';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/habitat-features/*` pages.
 *
 * @return {*}
 */
export const HabitatFeatureRouter = () => {
  return (
    <Switch>
      <Redirect
        exact
        from="/admin/projects/:id/surveys/:survey_id/habitat-features"
        to="/admin/projects/:id/surveys/:survey_id/habitat-features/details"
      />

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/habitat-features/details"
        title={getTitle('Manage Habitat Features')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <HabitatFeatureTableContextProvider>
              <SurveyHabitatFeaturePage />
            </HabitatFeatureTableContextProvider>
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};
