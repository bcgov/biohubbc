import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
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
import { CreateCSVMortalitiesPage } from './profile/mortality/import-mortalities/CreateCSVMortalitiesPage';

/**
 * Router for all `/admin/surveys/:survey_id/animals/*` pages.
 *
 * @return {*}
 */
export const AnimalRouter: React.FC = () => {
  return (
    <Switch>
      <Redirect exact from="/admin/surveys/:survey_id/animals" to="/admin/surveys/:survey_id/animals/details" />

      <RouteWithTitle exact path="/admin/surveys/:survey_id/animals/details" title={getTitle('Manage Animals')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <SurveyAnimalPage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle exact path={'/admin/surveys/:survey_id/animals/create'} title={getTitle('Create Animal')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateAnimalPage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle exact path={'/admin/surveys/:survey_id/animals/captures'} title={getTitle('Create Captures')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCSVCapturesPage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/surveys/:survey_id/animals/mortalities'}
        title={getTitle('Import Mortalities')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCSVMortalitiesPage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle exact path={'/admin/surveys/:survey_id/animals/:critter_id/edit'} title={getTitle('Edit Animal')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <TaxonomyContextProvider>
            <EditAnimalPage />
          </TaxonomyContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/surveys/:survey_id/animals/:critter_id/capture/create'}
        title={getTitle('Create Capture')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateCapturePage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/surveys/:survey_id/animals/:critter_id/capture/:capture_id/edit'}
        title={getTitle('Edit Capture')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditCapturePage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/surveys/:survey_id/animals/:critter_id/mortality/create'}
        title={getTitle('Report Mortality')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <CreateMortalityPage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path={'/admin/surveys/:survey_id/animals/:critter_id/mortality/:mortality_id/edit'}
        title={getTitle('Edit Mortality')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <EditMortalityPage />
        </SurveyRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};
