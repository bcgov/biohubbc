import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import AlertBar from 'components/alert/AlertBar';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface ISystemAlertBannerProps {
  alertTypes?: string[];
}

export const SystemAlertBanner = ({ alertTypes }: ISystemAlertBannerProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const biohubApi = useBiohubApi();

  const alertDataLoader = useDataLoader(() =>
    biohubApi.alert.getAlerts({ types: alertTypes, expiresAfter: dayjs().format() })
  );

  useEffect(() => {
    alertDataLoader.load();
  }, [alertDataLoader]);

  const alerts = alertDataLoader.data?.alerts ?? [];
  const maxShown = 2;

  const renderAlerts = (alertsToRender: any[]) =>
    alertsToRender.map((alert) => (
      <Collapse key={alert.alert_id}>
        <Box my={0.5}>
          <AlertBar severity={alert.severity} text={alert.message} title={alert.name} variant="outlined" />
        </Box>
      </Collapse>
    ));

  return (
    <Box mb={2}>
      <TransitionGroup>{renderAlerts(alerts.slice(0, isExpanded ? alerts.length : maxShown))}</TransitionGroup>
      {alerts.length > maxShown && (
        <Box mt={1}>
          <Button variant="text" onClick={() => setIsExpanded((prev) => !prev)} sx={{ color: grey[700] }}>
            {isExpanded ? 'See fewer alerts' : 'See more alerts'}
          </Button>
        </Box>
      )}
    </Box>
  );
};
