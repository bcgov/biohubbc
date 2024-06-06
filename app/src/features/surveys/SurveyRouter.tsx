import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import SurveyPage from 'features/surveys/view/SurveyPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import EditSurveyPage from './edit/EditSurveyPage';
import SamplingSitePage from './observations/sampling-sites/create/SamplingSitePage';
import SamplingSiteEditPage from './observations/sampling-sites/edit/SamplingSiteEditPage';
import SamplingSiteManagePage from './observations/sampling-sites/SamplingSiteManagePage';
import { SurveyObservationPage } from './observations/SurveyObservationPage';
import CreateTechniquePage from './technique/form/create/CreateTechniquePage';
import EditTechniquePage from './technique/form/edit/EditTechniquePage';
import ManualTelemetryPage from './telemetry/ManualTelemetryPage';
import { SurveyAnimalsPage } from './view/survey-animals/SurveyAnimalsPage';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/*` pages.
 *
 * @return {*}
 */
const SurveyRouter: React.FC = () => {
  return (
    <Switch>
      <Redirect
        exact
        from="/admin/projects/:id/surveys/:survey_id"
        to="/admin/projects/:id/surveys/:survey_id/details"
      />

      {/* Survey Page Routes */}
      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/details" title={getTitle('Surveys')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <SurveyPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Observations Routes */}
      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/observations"
        title={getTitle('Manage Observations')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <SurveyObservationPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Telemetry Routes */}
      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/telemetry" title={getTitle('Telemetry')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <ManualTelemetryPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Animals Routes */}
      <RouteWithTitle exact path={'/admin/projects/:id/surveys/:survey_id/animals'} title={getTitle('Manage Animals')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <SurveyAnimalsPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Technique routes */}
      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/manage-sampling/technique/create"
        title={getTitle('Create Technique')}>
        <DialogContextProvider>
          <CreateTechniquePage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/manage-sampling/technique/:method_technique_id/edit"
        title={getTitle('Edit Technique')}>
        <DialogContextProvider>
          <EditTechniquePage />
        </DialogContextProvider>
      </RouteWithTitle>

      {/* Sample Site Routes  TODO: Remove unused path and page */}
      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/manage-sampling"
        title={getTitle('Manage Sampling Sites')}>
        <DialogContextProvider>
          <SamplingSiteManagePage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/sampling" title={getTitle('Sampling Sites')}>
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

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/edit" title={getTitle('Edit Survey')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <EditSurveyPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};

export default SurveyRouter;
