import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import SurveyPage from 'features/surveys/view/SurveyPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { SurveyLocationPage } from './components/locations/SurveyLocationPage';
import EditSurveyPage from './edit/EditSurveyPage';
import SamplingSiteEditPage from './observations/sampling-sites/edit/SamplingSiteEditPage';
import SamplingSitePage from './observations/sampling-sites/SamplingSitePage';
import { SurveyObservationPage } from './observations/SurveyObservationPage';
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

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/details" title={getTitle('Surveys')}>
        <SurveyPage />
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/observations" title={getTitle('Observations')}>
        <SurveyObservationPage />
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/telemetry"
        title={getTitle('Manual Telemetry')}>
        <ManualTelemetryPage />
      </RouteWithTitle>
      <RouteWithTitle exact path={'/admin/projects/:id/surveys/:survey_id/animals'} title={getTitle('Manage Animals')}>
        <SurveyAnimalsPage />
      </RouteWithTitle>

      {/* Sample Site Routes */}
      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/sampling" title={getTitle('Sampling Sites')}>
        <SamplingSitePage />
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/:survey_sample_site_id/edit"
        title={getTitle('Edit Sampling Site')}>
        <SamplingSiteEditPage />
      </RouteWithTitle>

      {/* Survey Locations */}
      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/locations" title={getTitle('Survey Area')}>
        <SurveyLocationPage />
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/edit" title={getTitle('Edit Survey')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditSurveyPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};

export default SurveyRouter;
