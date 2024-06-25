import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import { SamplingSiteManagePage } from 'features/surveys/sampling-information/manage/SamplingSiteManagePage';
import SamplingSitePage from 'features/surveys/sampling-information/sites/create/SamplingSitePage';
import SamplingSiteEditPage from 'features/surveys/sampling-information/sites/edit/SamplingSiteEditPage';
import { CreateTechniquePage } from 'features/surveys/sampling-information/techniques/form/create/CreateTechniquePage';
import EditTechniquePage from 'features/surveys/sampling-information/techniques/form/edit/EditTechniquePage';
import { Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/sampling/*` pages.
 *
 * @return {*}
 */
export const SamplingRouter = () => {
  return (
    <Switch>
      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling"
        title={getTitle('Manage Sampling Information')}>
        <DialogContextProvider>
          <SamplingSiteManagePage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/create"
        title={getTitle('Create Sampling Sites')}>
        <DialogContextProvider>
          <SamplingSitePage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/:survey_sample_site_id/edit"
        title={getTitle('Edit Sampling Site')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <SamplingSiteEditPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/techniques/create"
        title={getTitle('Create Technique')}>
        <DialogContextProvider>
          <CreateTechniquePage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/techniques/:method_technique_id/edit"
        title={getTitle('Edit Technique')}>
        <DialogContextProvider>
          <EditTechniquePage />
        </DialogContextProvider>
      </RouteWithTitle>
    </Switch>
  );
};
