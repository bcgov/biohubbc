import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ObservationsContextProvider } from 'contexts/observationsContext';
import { ProjectAuthStateContextProvider } from 'contexts/projectAuthStateContext';
import { ProjectContextProvider } from 'contexts/projectContext';
import { SurveyContextProvider } from 'contexts/surveyContext';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import ProjectPage from 'features/projects/view/ProjectPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import SurveyRouter from 'features/surveys/SurveyRouter';
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
        <ProjectsListPage />
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/projects/create" title={getTitle('Create Project')}>
        <CreateProjectPage />
      </RouteWithTitle>

      <Redirect exact from="/admin/projects/:id" to="/admin/projects/:id/details" />

      <RouteWithTitle path="/admin/projects/:id" title={getTitle('Project Details')}>
        <ProjectAuthStateContextProvider>
          <ProjectContextProvider>
            <RouteWithTitle exact path="/admin/projects/:id/details" title={getTitle('Projects')}>
              <ProjectRoleRouteGuard
                validProjectPermissions={[
                  PROJECT_PERMISSION.COORDINATOR,
                  PROJECT_PERMISSION.COLLABORATOR,
                  PROJECT_PERMISSION.OBSERVER
                ]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <ProjectPage />
              </ProjectRoleRouteGuard>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/edit" title={getTitle('Edit Project')}>
              <ProjectRoleRouteGuard
                validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <EditProjectPage />
              </ProjectRoleRouteGuard>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/users" title={getTitle('Project Team')}>
              <ProjectRoleRouteGuard
                validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <ProjectParticipantsPage />
              </ProjectRoleRouteGuard>
            </RouteWithTitle>

            <RouteWithTitle path="/admin/projects/:id/surveys/:survey_id" title={getTitle('Surveys')}>
              <ProjectRoleRouteGuard
                validProjectPermissions={[
                  PROJECT_PERMISSION.COORDINATOR,
                  PROJECT_PERMISSION.COLLABORATOR,
                  PROJECT_PERMISSION.OBSERVER
                ]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <SurveyContextProvider>
                  <ObservationsContextProvider>
                    <TelemetryDataContextProvider>
                      <SurveyRouter />
                    </TelemetryDataContextProvider>
                  </ObservationsContextProvider>
                </SurveyContextProvider>
              </ProjectRoleRouteGuard>
            </RouteWithTitle>

            <RouteWithTitle exact path="/admin/projects/:id/survey/create" title={getTitle('Create Survey')}>
              <ProjectRoleRouteGuard
                validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <CreateSurveyPage />
              </ProjectRoleRouteGuard>
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
