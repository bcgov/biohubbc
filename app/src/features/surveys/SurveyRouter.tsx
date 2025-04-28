import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { AnimalPageContextProvider } from 'contexts/animalPageContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ObservationsContextProvider } from 'contexts/observationsContext';
import { AnimalRouter } from 'features/surveys/animals/AnimalRouter';
import EditSurveyPage from 'features/surveys/edit/EditSurveyPage';
import EditObservationPage from 'features/surveys/observations/form/edit/EditObservationPage';
import { SurveyObservationPage } from 'features/surveys/observations/SurveyObservationPage';
import { SamplingRouter } from 'features/surveys/sampling-information/SamplingRouter';
import SurveyPage from 'features/surveys/view/SurveyPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { HabitatFeatureRouter } from './habitat-features/SurveyHabitatFeatureRouter';
import CreateObservationPage from './observations/form/create/CreateObservationPage';
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
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <SurveyPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/edit" title={getTitle('Edit Survey')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[SURVEY_PERMISSION.COORDINATOR, SURVEY_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <EditSurveyPage />
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Animals Routes */}
      <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id/animals" title={getTitle('Manage Animals')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <AnimalPageContextProvider>
              <AnimalRouter />
            </AnimalPageContextProvider>
          </DialogContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Telemetry Routes */}
      <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id/telemetry" title={getTitle('Manage Telemetry')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <TelemetryRouter />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Habitat Features Routes */}
      <RouteWithTitle
        path="/admin/projects/:id/surveys/:survey_id/habitat-features"
        title={getTitle('Manage Habitat Features')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <HabitatFeatureRouter />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Observations Routes */}
      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/observations"
        title={getTitle('Manage Observations')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <ObservationsContextProvider>
            <SurveyObservationPage />
          </ObservationsContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/observations/create"
        title={getTitle('Create Observation')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[SURVEY_PERMISSION.COORDINATOR, SURVEY_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateObservationPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/observations/:observation_id/edit"
        title={getTitle('Edit Observation')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[SURVEY_PERMISSION.COORDINATOR, SURVEY_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditObservationPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      {/* Sampling routes */}
      <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id/sampling" title={getTitle('Surveys')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
          ]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <SamplingRouter />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};

export default SurveyRouter;
