import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContextProvider } from 'contexts/dialogContext';
import { CreateDeploymentPage } from 'features/surveys/telemetry/manage/deployments/create/CreateDeploymentPage';
import { EditDeploymentPage } from 'features/surveys/telemetry/manage/deployments/edit/EditDeploymentPage';
import { CreateDevicePage } from 'features/surveys/telemetry/manage/devices/create/CreateDevicePage';
import { EditDevicePage } from 'features/surveys/telemetry/manage/devices/edit/EditDevicePage';
import { DevicesAndDeploymentsManagePage } from 'features/surveys/telemetry/manage/DevicesAndDeploymentsManagePage';
import { TelemetryPage } from 'features/surveys/telemetry/TelemetryPage';
import { Redirect, Switch } from 'react-router';
import RouteWithTitle from 'utils/RouteWithTitle';
import { getTitle } from 'utils/Utils';

/**
 * Router for all `/admin/surveys/:survey_id/telemetry/*` pages.
 *
 * @return {*}
 */
export const TelemetryRouter = () => {
  return (
    <Switch>
      <Redirect exact from="/admin/surveys/:survey_id/telemetry" to="/admin/surveys/:survey_id/telemetry/details" />

      <RouteWithTitle exact path="/admin/surveys/:survey_id/telemetry/details" title={getTitle('Telemetry')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <TelemetryPage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/telemetry/manage"
        title={getTitle('Devices and Deployments')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <DevicesAndDeploymentsManagePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/telemetry/manage/device/create"
        title={getTitle('Add Device')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <CreateDevicePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/telemetry/manage/device/:device_id/edit"
        title={getTitle('Edit Device')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <EditDevicePage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/telemetry/manage/deployment/create"
        title={getTitle('Add Deployment')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <CreateDeploymentPage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>

      <RouteWithTitle
        exact
        path="/admin/surveys/:survey_id/telemetry/manage/deployment/:deployment_id/edit"
        title={getTitle('Edit Deployment')}>
        <SurveyRoleRouteGuard
          validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <DialogContextProvider>
            <EditDeploymentPage />
          </DialogContextProvider>
        </SurveyRoleRouteGuard>
      </RouteWithTitle>
    </Switch>
  );
};
