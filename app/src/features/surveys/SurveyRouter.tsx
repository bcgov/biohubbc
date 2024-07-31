import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { AnimalPageContextProvider } from 'contexts/animalPageContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { AnimalRouter } from 'features/surveys/animals/AnimalRouter';
import EditSurveyPage from 'features/surveys/edit/EditSurveyPage';
import { SurveyObservationPage } from 'features/surveys/observations/SurveyObservationPage';
import { SamplingRouter } from 'features/surveys/sampling-information/SamplingRouter';
import SurveyPage from 'features/surveys/view/SurveyPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { SamplingSiteManagePage } from './sampling-information/manage/SamplingSiteManagePage';
import { TelemetryRouter } from './telemetry/TelemetryRouter';

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
      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/details" title={getTitle('Survey')}>
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

      {/* Animals Routes */}
      <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id/animals" title={getTitle('Manage Animals')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <AnimalPageContextProvider>
            <AnimalRouter />
          </AnimalPageContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Telemetry Routes */}
      <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id/telemetry" title={getTitle('Manage Telemetry')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <AnimalPageContextProvider>
            <TelemetryRouter />
          </AnimalPageContextProvider>
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

      {/* Sample Site Routes  TODO: Remove unused path and page */}
      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/sampling" title={getTitle('Sampling Sites')}>
        <DialogContextProvider>
          <SamplingSiteManagePage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/:survey_sample_site_id/edit"
        title={getTitle('Edit Sampling Site')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <SamplingRouter />
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
