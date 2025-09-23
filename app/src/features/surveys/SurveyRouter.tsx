import React from 'react';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router-dom';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';

import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';

import { AnimalPageContextProvider } from 'contexts/animalPageContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ObservationsContextProvider } from 'contexts/observationsContext';

import { HabitatFeatureTableContextProvider } from 'contexts/habitatFeatureTableContext';
import { SurveyAuthStateContextProvider } from 'contexts/surveyAuthStateContext';
import { SurveyContextProvider } from 'contexts/surveyContext';
import { AnimalRouter } from 'features/surveys/animals/AnimalRouter';
import EditSurveyPage from 'features/surveys/edit/EditSurveyPage';
import EditObservationPage from 'features/surveys/observations/form/edit/EditObservationPage';
import { SurveyObservationPage } from 'features/surveys/observations/SurveyObservationPage';
import { SamplingRouter } from 'features/surveys/sampling-information/SamplingRouter';
import { SurveyPage } from './details/SurveyPage';
import { HabitatFeatureRouter } from './habitat-features/SurveyHabitatFeatureRouter';
import CreateObservationPage from './observations/form/create/CreateObservationPage';
import { TelemetryRouter } from './telemetry/TelemetryRouter';

const SurveyRouter: React.FC = () => {
  return (
    <Switch>
      <Redirect from="/admin/surveys/:survey_id" to="/admin/surveys/:survey_id/details" exact />
      {/* Wrap all routes under the survey_id param */}
      <Route path="/admin/surveys/:survey_id">
        <SurveyAuthStateContextProvider>
          <SurveyContextProvider>
            <HabitatFeatureTableContextProvider>
              <Switch>
                <RouteWithTitle exact path={`/admin/surveys/:survey_id/details`} title={getTitle('Survey')}>
                  <SurveyRoleRouteGuard
                    validSystemRoles={[
                      SYSTEM_ROLE.SYSTEM_ADMIN,
                      SYSTEM_ROLE.DATA_ADMINISTRATOR,
                      SYSTEM_ROLE.PROJECT_CREATOR
                    ]}
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER]}>
                    <SurveyPage />
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                <RouteWithTitle exact path={`/admin/surveys/:survey_id/edit`} title={getTitle('Edit Survey')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <DialogContextProvider>
                      <EditSurveyPage />
                    </DialogContextProvider>
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                {/* Animals */}
                <RouteWithTitle path={`/admin/surveys/:survey_id/animals`} title={getTitle('Manage Animals')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <DialogContextProvider>
                      <AnimalPageContextProvider>
                        <AnimalRouter />
                      </AnimalPageContextProvider>
                    </DialogContextProvider>
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                {/* Telemetry */}
                <RouteWithTitle path={`/admin/surveys/:survey_id/telemetry`} title={getTitle('Manage Telemetry')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <TelemetryRouter />
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                {/* Habitat Features */}
                <RouteWithTitle
                  path={`/admin/surveys/:survey_id/habitat-features`}
                  title={getTitle('Manage Habitat Features')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <HabitatFeatureRouter />
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                {/* Observations */}
                <RouteWithTitle
                  exact
                  path={`/admin/surveys/:survey_id/observations`}
                  title={getTitle('Manage Observations')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <ObservationsContextProvider>
                      <SurveyObservationPage />
                    </ObservationsContextProvider>
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                <RouteWithTitle
                  exact
                  path={`/admin/surveys/:survey_id/observations/create`}
                  title={getTitle('Create Observation')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <CreateObservationPage />
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                <RouteWithTitle
                  exact
                  path={`/admin/surveys/:survey_id/observations/:observation_id/edit`}
                  title={getTitle('Edit Observation')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <EditObservationPage />
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>

                {/* Sampling */}
                <RouteWithTitle path={`/admin/surveys/:survey_id/sampling`} title={getTitle('Surveys')}>
                  <SurveyRoleRouteGuard
                    validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <SamplingRouter />
                  </SurveyRoleRouteGuard>
                </RouteWithTitle>
              </Switch>
            </HabitatFeatureTableContextProvider>
          </SurveyContextProvider>
        </SurveyAuthStateContextProvider>
      </Route>
      <Redirect from="/admin/surveys/:survey_id/details" to="/admin/surveys" exact />
    </Switch>
  );
};

export default SurveyRouter;
