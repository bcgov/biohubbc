import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import SurveyPage from 'features/surveys/view/SurveyPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import EditSurveyPage from './edit/EditSurveyPage';
import SamplingSiteEditPage from './observations/sampling-sites/edit/SamplingSiteEditPage';
import SamplingSitePage from './observations/sampling-sites/SamplingSitePage';
import { SurveyObservationPage } from './observations/SurveyObservationPage';

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
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/observations" title={getTitle('Observations')}>
        <ProjectsLayout>
          <SurveyObservationPage />
        </ProjectsLayout>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/sampling" title={getTitle('Sampling Sites')}>
        <ProjectsLayout>
          <SamplingSitePage />
        </ProjectsLayout>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/projects/:id/surveys/:survey_id/sampling/:survey_sample_site_id/edit"
        title={getTitle('Edit Sampling Site')}>
        <ProjectsLayout>
          <SamplingSiteEditPage />
        </ProjectsLayout>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/:id/surveys/:survey_id/edit" title={getTitle('Edit Survey')}>
        <ProjectsLayout>
          <ProjectRoleRouteGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <EditSurveyPage />
          </ProjectRoleRouteGuard>
        </ProjectsLayout>
      </RouteWithTitle>
    </Switch>
  );
};

export default SurveyRouter;
