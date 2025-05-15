import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import { CreateSamplingSitePage } from 'features/surveys/sampling-information/sites/create/CreateSamplingSitePage';
import { EditSamplingSitePage } from 'features/surveys/sampling-information/sites/edit/EditSamplingSitePage';
import { CreateTechniquePage } from 'features/surveys/sampling-information/techniques/create/CreateTechniquePage';
import { EditTechniquePage } from 'features/surveys/sampling-information/techniques/edit/EditTechniquePage';
import { Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';
import { SamplingSiteManagePage } from './manage/SamplingSiteManagePage';
import { CreateSamplePeriodPage } from './periods/create/CreateSamplePeriodPage';
import { EditSamplePeriodPage } from './periods/edit/EditSamplePeriodPage';

/**
 * Router for all `/admin/surveys/:survey_id/sampling/*` pages.
 *
 * @return {*}
 */
export const SamplingRouter = () => {
  return (
    <Switch>
      <RouteWithTitle exact path="/admin/surveys/:survey_id/sampling" title={getTitle('Manage Sampling Information')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <SamplingSiteManagePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/surveys/:survey_id/sampling/create" title={getTitle('Create Sampling Sites')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <CreateSamplingSitePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/sampling/:survey_sample_site_id/edit"
        title={getTitle('Edit Sampling Site')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <EditSamplingSitePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/sampling/techniques/create"
        title={getTitle('Create Technique')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <CreateTechniquePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/sampling/techniques/:method_technique_id/edit"
        title={getTitle('Edit Technique')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <EditTechniquePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle exact path="/admin/surveys/:survey_id/sampling/period/create" title={getTitle('Create Periods')}>
        <DialogContextProvider>
          <CreateSamplePeriodPage />
        </DialogContextProvider>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/sampling/period/:survey_sample_period_id/edit"
        title={getTitle('Edit Period')}>
        <DialogContextProvider>
          <EditSamplePeriodPage />
        </DialogContextProvider>
      </RouteWithTitle>
    </Switch>
  );
};
