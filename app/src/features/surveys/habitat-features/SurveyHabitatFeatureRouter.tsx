import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import { HabitatFeatureTableContextProvider } from 'contexts/habitatFeatureTableContext';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { CreateHabitatFeaturePage } from './create/CreateHabitatFeaturePage';
import { EditHabitatFeaturePage } from './edit/EditHabitatFeaturePage';
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

      <Redirect
        exact
        from="/admin/projects/:id/surveys/:survey_id/habitat-features/sampling/:survey_sample_site_id/edit"
        to="/admin/projects/:id/surveys/:survey_id/sampling/:survey_sample_site_id/edit"
      />

      <Redirect
        exact
        from="/admin/projects/:id/surveys/:survey_id/habitat-features/sampling"
        to="/admin/projects/:id/surveys/:survey_id/sampling"
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

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/habitat-features/create"
        title={getTitle('Create Habitat Feature')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <HabitatFeatureTableContextProvider>
              <CreateHabitatFeaturePage />
            </HabitatFeatureTableContextProvider>
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/habitat-features/:survey_habitat_feature_id/edit"
        title={getTitle('Edit Habitat Feature')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <HabitatFeatureTableContextProvider>
              <EditHabitatFeaturePage />
            </HabitatFeatureTableContextProvider>
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};
