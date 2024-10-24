import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { CreateCapturePage } from 'features/surveys/animals/profile/captures/capture-form/create/CreateCapturePage';
import { EditCapturePage } from 'features/surveys/animals/profile/captures/capture-form/edit/EditCapturePage';
import { CreateMortalityPage } from 'features/surveys/animals/profile/mortality/mortality-form/create/CreateMortalityPage';
import { EditMortalityPage } from 'features/surveys/animals/profile/mortality/mortality-form/edit/EditMortalityPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { CreateAnimalPage } from './animal-form/create/CreateAnimalPage';
import { EditAnimalPage } from './animal-form/edit/EditAnimalPage';
import { SurveyAnimalPage } from './AnimalPage';
import { CreateCSVCapturesPage } from './profile/captures/import-captures/CreateCSVCapturesPage';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/animals/*` pages.
 *
 * @return {*}
 */
export const AnimalRouter: React.FC = () => {
  return (
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
          <SurveyAnimalPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/create'}
        title={getTitle('Create Animal')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateAnimalPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/captures'}
        title={getTitle('Create Captures')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCSVCapturesPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/edit'}
        title={getTitle('Edit Animal')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <TaxonomyContextProvider>
            <EditAnimalPage />
          </TaxonomyContextProvider>
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/capture/create'}
        title={getTitle('Create Capture')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCapturePage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/capture/:capture_id/edit'}
        title={getTitle('Edit Capture')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditCapturePage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/mortality/create'}
        title={getTitle('Report Mortality')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateMortalityPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/mortality/:mortality_id/edit'}
        title={getTitle('Edit Mortality')}>
        <ProjectRoleRouteGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditMortalityPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};
