import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import SurveyPage from 'features/surveys/view/SurveyPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Route, Switch } from 'react-router';
import EditSurveyPage from './edit/EditSurveyPage';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/*` pages.
 *
 * @return {*}
 */
const SurveyRouter: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/admin/projects/:id/surveys/:survey_id/details">
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </Route>

      <Route exact path="/admin/projects/:id/surveys/:survey_id/edit">
        <ProjectsLayout>
          <ProjectRoleRouteGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validProjectRoles={[]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <EditSurveyPage />
          </ProjectRoleRouteGuard>
        </ProjectsLayout>
      </Route>
    </Switch>
  );
};

export default SurveyRouter;
