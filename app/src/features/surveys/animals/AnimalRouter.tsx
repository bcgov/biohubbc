import { ProjectRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
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
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <SurveyAnimalPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/create'}
        title={getTitle('Create Animal')}>
        <ProjectRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateAnimalPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/captures'}
        title={getTitle('Create Captures')}>
        <ProjectRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCSVCapturesPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/edit'}
        title={getTitle('Edit Animal')}>
        <ProjectRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
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
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCapturePage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/capture/:capture_id/edit'}
        title={getTitle('Edit Capture')}>
        <ProjectRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditCapturePage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/mortality/create'}
        title={getTitle('Report Mortality')}>
        <ProjectRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateMortalityPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/projects/:id/surveys/:survey_id/animals/:critter_id/mortality/:mortality_id/edit'}
        title={getTitle('Edit Mortality')}>
        <ProjectRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditMortalityPage />
        </ProjectRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};
