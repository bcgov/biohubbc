import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import SurveyPage from 'features/surveys/view/SurveyPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import EditSurveyPage from './edit/EditSurveyPage';

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

      <Route exact path="/admin/projects/:id/surveys/:survey_id/details">
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </Route>

      <RouteWithTitle title={getTitle('Edit Survey')} exact path="/admin/projects/:id/surveys/:survey_id/edit">
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
