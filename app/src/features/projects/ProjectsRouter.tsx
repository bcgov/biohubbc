import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ObservationsContextProvider } from 'contexts/observationsContext';
import { ProjectAuthStateContextProvider } from 'contexts/projectAuthStateContext';
import { ProjectContextProvider } from 'contexts/projectContext';
import { SurveyContextProvider } from 'contexts/surveyContext';
import ProjectPage from 'features/projects/view/ProjectPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import SurveyRouter from 'features/surveys/SurveyRouter';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import CreateProjectPage from './create/CreateProjectPage';
import EditProjectPage from './edit/EditProjectPage';
import ProjectsListPage from './list/ProjectsListPage';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';

/**
 * Router for all `/admin/projects/*` pages.
 *
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <RouteWithTitle exact path="/admin/projects" title={getTitle('Projects')}>
        <ProjectsLayout>
          <ProjectsListPage />
        </ProjectsLayout>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/create" title={getTitle('Create Project')}>
        <ProjectsLayout>
          <CreateProjectPage />
        </ProjectsLayout>
      </RouteWithTitle>

      <Redirect exact from="/admin/projects/:id" to="/admin/projects/:id/details" />

      <RouteWithTitle path="/admin/projects/:id" title={getTitle('Surveys')}>
        <ProjectAuthStateContextProvider>
          <ProjectContextProvider>
            <RouteWithTitle exact path="/admin/projects/:id/details" title={getTitle('Surveys')}>
              <ProjectsLayout>
                <ProjectRoleRouteGuard
                  validProjectPermissions={[
                    PROJECT_PERMISSION.COORDINATOR,
                    PROJECT_PERMISSION.COLLABORATOR,
                    PROJECT_PERMISSION.OBSERVER
                  ]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <ProjectPage />
                </ProjectRoleRouteGuard>
              </ProjectsLayout>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/edit" title={getTitle('Edit Project')}>
              <ProjectsLayout>
                <ProjectRoleRouteGuard
                  validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <EditProjectPage />
                </ProjectRoleRouteGuard>
              </ProjectsLayout>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/users" title={getTitle('Project Team')}>
              <ProjectsLayout>
                <ProjectRoleRouteGuard
                  validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <ProjectParticipantsPage />
                </ProjectRoleRouteGuard>
              </ProjectsLayout>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/surveys" title={getTitle('Surveys')}>
              <ProjectsLayout>
                <ProjectRoleRouteGuard
                  validProjectPermissions={[
                    PROJECT_PERMISSION.COORDINATOR,
                    PROJECT_PERMISSION.COLLABORATOR,
                    PROJECT_PERMISSION.OBSERVER
                  ]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <ProjectPage />
                </ProjectRoleRouteGuard>
              </ProjectsLayout>
            </RouteWithTitle>

            <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id" title={getTitle('Surveys')}>
              <ProjectsLayout>
                <ProjectRoleRouteGuard
                  validProjectPermissions={[
                    PROJECT_PERMISSION.COORDINATOR,
                    PROJECT_PERMISSION.COLLABORATOR,
                    PROJECT_PERMISSION.OBSERVER
                  ]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <SurveyContextProvider>
                    <ObservationsContextProvider>
                      <SurveyRouter />
                    </ObservationsContextProvider>
                  </SurveyContextProvider>
                </ProjectRoleRouteGuard>
              </ProjectsLayout>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/survey/create" title={getTitle('Create Survey')}>
              <ProjectsLayout>
                <ProjectRoleRouteGuard
                  validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <CreateSurveyPage />
                </ProjectRoleRouteGuard>
              </ProjectsLayout>
            </RouteWithTitle>
          </ProjectContextProvider>
        </ProjectAuthStateContextProvider>
      </RouteWithTitle>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/admin/projects/*">
        <Redirect to="/page-not-found" />
      </Route>
    </Switch>
  );
};

export default ProjectsRouter;
