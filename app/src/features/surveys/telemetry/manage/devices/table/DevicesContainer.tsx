import { mdiArrowTopRight, mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toggle/CustomToggleButtonGroup';
import dayjs from 'dayjs';
import { DevicesTable } from 'features/surveys/telemetry/manage/devices/table/DevicesTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { combineDateTime } from 'utils/datetime';
import { TelemetryDeviceKeysButton } from '../../device-keys/TelemetryDeviceKeysButton';

export const DevicesContainer = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  // State for tabs
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const devicesDataLoader = useDataLoader((surveyId: number) => biohubApi.telemetryDevice.getDevicesInSurvey(surveyId));

  useEffect(() => {
    devicesDataLoader.load(surveyContext.surveyId);
  }, [devicesDataLoader, surveyContext.surveyId]);

  const devices = useMemo(() => devicesDataLoader.data?.devices ?? [], [devicesDataLoader.data]);
  const devicesCount = devicesDataLoader.data?.count ?? 0;

  // Deployments data loader
  const deploymentsDataLoader = useDataLoader((surveyId: number) =>
    biohubApi.telemetryDeployment.getDeploymentsInSurvey(surveyId)
  );

  useEffect(() => {
    deploymentsDataLoader.load(surveyContext.surveyId);
  }, [deploymentsDataLoader, surveyContext.surveyId]);

  const deployments = useMemo(() => deploymentsDataLoader.data?.deployments ?? [], [deploymentsDataLoader.data]);

  // Helper functions to determine device status
  const getDeviceDeploymentsForSerial = (deployments: TelemetryDeployment[], serial: string) =>
    deployments.filter((dep) => dep.device_key?.split(':')[1] === serial);

  const isDeploymentActive = (deployment: TelemetryDeployment) => {
    const now = dayjs();
    const start = combineDateTime(deployment.attachment_start_date, deployment.attachment_start_time);
    const end = deployment.attachment_end_date
      ? combineDateTime(deployment.attachment_end_date, deployment.attachment_end_time)
      : null;
    return now.isAfter(start) && (!end || now.isBefore(end));
  };

  // Memoized filtered devices
  const activeDevices = useMemo(
    () =>
      devices.filter((device) => {
        const deviceDeployments = getDeviceDeploymentsForSerial(deployments, device.serial);
        return deviceDeployments.some(isDeploymentActive);
      }),
    [devices, deployments]
  );
  const inactiveDevices = useMemo(
    () =>
      devices.filter((device) => {
        const deviceDeployments = getDeviceDeploymentsForSerial(deployments, device.serial);
        return !deviceDeployments.some(isDeploymentActive);
      }),
    [devices, deployments]
  );
  const currentDevices = activeTab === 'active' ? activeDevices : inactiveDevices;

  // Extracted NoDataOverlay
  const noDataOverlay = (
    <NoDataOverlay
      minHeight="300px"
      height="100%"
      title={activeTab === 'active' ? 'No Active Devices' : 'No Inactive Devices'}
      subtitle={
        activeTab === 'active'
          ? 'No devices are currently deployed. Deploy devices to see them here.'
          : 'No inactive devices found. All devices are currently deployed.'
      }
      icon={mdiArrowTopRight}
      sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    />
  );

  return (
    <>
      <Toolbar sx={{ flex: '0 0 auto', pr: 3 }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Devices &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({devicesCount})
          </Typography>
        </Typography>
        <Stack flexDirection="row" alignItems="center" gap={1} overflow="hidden" whiteSpace="nowrap">
          <TelemetryDeviceKeysButton />
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/`}
            startIcon={<Icon path={mdiCog} size={0.8} />}>
            Manage
          </Button>
        </Stack>
      </Toolbar>

      <Divider flexItem />

      {/* Toggle buttons for Active/Inactive devices */}
      <Box p={2} display="flex" justifyContent="flex-start">
        <Box
          sx={{
            '& .MuiToggleButton-root': {
              whiteSpace: 'nowrap',
              minWidth: 'auto'
            }
          }}>
          <CustomToggleButtonGroup
            views={[
              { value: 'active', label: `Active (${activeDevices.length})` },
              { value: 'inactive', label: `Inactive (${inactiveDevices.length})` }
            ]}
            activeView={activeTab}
            onViewChange={(newValue) => {
              setActiveTab(newValue);
            }}
            orientation="horizontal"
          />
        </Box>
      </Box>

      <Divider flexItem />

      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%'
        }}>
        <LoadingGuard
          isLoading={devicesDataLoader.isLoading || !devicesDataLoader.isReady}
          isLoadingFallback={<SkeletonTable numberOfLines={5} />}
          isLoadingFallbackDelay={100}
          hasNoData={devicesDataLoader.data?.count === 0}
          hasNoDataFallback={noDataOverlay}>
          {currentDevices.length === 0 ? (
            noDataOverlay
          ) : (
            <DevicesTable deployments={deployments} devices={currentDevices} />
          )}
        </LoadingGuard>
      </Box>
    </>
  );
};
