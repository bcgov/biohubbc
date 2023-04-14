import { ProjectContextProvider } from 'contexts/projectContext';
import { SurveyContextProvider } from 'contexts/surveyContext';
import ProjectPage from 'features/projects/view/ProjectPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import SurveyRouter from 'features/surveys/SurveyRouter';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import { getTitle } from 'utils/Utils';
import CreateProjectPage from './create/CreateProjectPage';
import EditProjectPage from './edit/EditProjectPage';
import ProjectsListPage from './list/ProjectsListPage';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';
// import { ProjectAuthStateContextProvider } from 'contexts/projectAuthStateContext';
import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';

/**
 * Router for all `/admin/projects/*` pages.
 *
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/admin/projects" layout={ProjectsLayout}>
        <ProjectsListPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/create" layout={ProjectsLayout}>
        <CreateProjectPage />
      </AppRoute>

      <Redirect exact from="/admin/projects/:id" to="/admin/projects/:id/details" />

      <AppRoute path="/admin/projects/:id" strict>
        <ProjectContextProvider>
          <AppRoute exact path="/admin/projects/:id/details" layout={ProjectsLayout}>
            <ProjectRoleRouteGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_VIEWER]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <ProjectPage />
            </ProjectRoleRouteGuard>
          </AppRoute>

          <AppRoute exact path="/admin/projects/:id/edit" layout={ProjectsLayout}>
            <ProjectRoleRouteGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <EditProjectPage />
            </ProjectRoleRouteGuard>
          </AppRoute>
          
          <AppRoute exact path="/admin/projects/:id/users" layout={ProjectsLayout}>
            <ProjectRoleRouteGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <ProjectParticipantsPage />
            </ProjectRoleRouteGuard>
          </AppRoute>

          <AppRoute exact path="/admin/projects/:id/surveys" layout={ProjectsLayout}>
            <ProjectRoleRouteGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_VIEWER]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <ProjectPage />
            </ProjectRoleRouteGuard>
          </AppRoute>

          <AppRoute path="/admin/projects/:id/surveys/:survey_id" title={getTitle('Surveys')} layout={ProjectsLayout}>
            <ProjectRoleRouteGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_VIEWER]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <SurveyContextProvider>
                <SurveyRouter />
              </SurveyContextProvider>
            </ProjectRoleRouteGuard>
          </AppRoute>

          <AppRoute exact path="/admin/projects/:id/survey/create" layout={ProjectsLayout}>
            <ProjectRoleRouteGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <CreateSurveyPage />
            </ProjectRoleRouteGuard>
          </AppRoute>
        </ProjectContextProvider>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default ProjectsRouter;
