import Stack from '@mui/material/Stack';
import AlertBar from 'components/alert/AlertBar';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

interface ISystemAlertBannerProps {
  alertTypes?: [];
}
/**
 * Renders active alerts of the specified alertTypes
 *
 * @return {*}  {IStaticLayer}
 */
export const SystemAlertBanner = (props: ISystemAlertBannerProps) => {
  const { alertTypes } = props;

  const biohubApi = useBiohubApi();

  const alertDataLoader = useDataLoader(() =>
    biohubApi.alert.getAlerts({ types: alertTypes, recordEndDate: dayjs().format() })
  );

  useEffect(() => {
    alertDataLoader.load();
  }, []);

  const alerts = alertDataLoader.data?.alerts ?? [];
  return (
    <Stack gap={1}>
      {alerts.map((alert) => (
        <AlertBar key={alert.alert_id} severity="error" text={alert.message} title={alert.name} variant="outlined" startCollapsed />
      ))}
    </Stack>
  );
};
