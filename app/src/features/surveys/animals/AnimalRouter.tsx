import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import CreateAnimalPage from './create/CreateAnimalPage';
import EditAnimalPage from './edit/EditAnimalPage';
import CreateCapturePage from './profile/captures/create/CreateCapturePage';
import SurveyAnimalPage from './SurveyAnimalPage';
import EditCapturePage from './profile/captures/edit/EditCapturePage';
import CreateMortalityPage from './profile/mortality/create/CreateMortalityPage';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/animals/*` pages.
 *
 * @return {*}
 */
const AnimalRouter: React.FC = () => (
  <Switch>
    <Redirect
      exact
      from="/admin/projects/:id/surveys/:survey_id/animals"
      to="/admin/projects/:id/surveys/:survey_id/animals/details"
    />

    <RouteWithTitle
      exact
      path="/admin/projects/:id/surveys/:survey_id/animals/details"
      title={getTitle('Manage Animals')}>
      <ProjectRoleRouteGuard
        validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <DialogContextProvider>
          <SurveyAnimalPage />
        </DialogContextProvider>
      </ProjectRoleRouteGuard>
    </RouteWithTitle>

    <RouteWithTitle
      exact
      path={'/admin/projects/:id/surveys/:survey_id/animals/create'}
      title={getTitle('Create Animal')}>
      <ProjectRoleRouteGuard
        validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <DialogContextProvider>
          <CreateAnimalPage />
        </DialogContextProvider>
      </ProjectRoleRouteGuard>
    </RouteWithTitle>

    <RouteWithTitle
      exact
      path={'/admin/projects/:id/surveys/:survey_id/animals/:survey_critter_id/edit'}
      title={getTitle('Edit Animal')}>
      <ProjectRoleRouteGuard
        validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <EditAnimalPage />
      </ProjectRoleRouteGuard>
    </RouteWithTitle>

    <RouteWithTitle
      exact
      path={'/admin/projects/:id/surveys/:survey_id/animals/:survey_critter_id/capture/create'}
      title={getTitle('Create Capture')}>
      <ProjectRoleRouteGuard
        validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <DialogContextProvider>
          <CreateCapturePage />
        </DialogContextProvider>
      </ProjectRoleRouteGuard>
    </RouteWithTitle>

    <RouteWithTitle
      exact
      path={'/admin/projects/:id/surveys/:survey_id/animals/:survey_critter_id/capture/:capture_id/edit'}
      title={getTitle('Edit Capture')}>
      <ProjectRoleRouteGuard
        validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <DialogContextProvider>
          <EditCapturePage />
        </DialogContextProvider>
      </ProjectRoleRouteGuard>
    </RouteWithTitle>

    <RouteWithTitle
      exact
      path={'/admin/projects/:id/surveys/:survey_id/animals/:survey_critter_id/mortality/create'}
      title={getTitle('Report Mortality')}>
      <ProjectRoleRouteGuard
        validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <DialogContextProvider>
          <CreateMortalityPage />
        </DialogContextProvider>
      </ProjectRoleRouteGuard>
    </RouteWithTitle>
  </Switch>
);

export default AnimalRouter;
