import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { AlertProps } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAlert, SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { useEffect, useState } from 'react';

interface ISystemAlertBannerProps extends AlertProps {
  alertTypes?: SystemAlertBannerEnum[];
}

// The number of alerts to show on initial page load
const NumberOfAlertsShownInitially = 2;

/**
 * Stack of system alerts created by system administrators
 *
 * @param {ISystemAlertBannerProps} props
 * @returns
 */
export const SystemAlertBanner = (props: ISystemAlertBannerProps) => {
  const { alertTypes, ...alertProps } = props;

  const biohubApi = useBiohubApi();

  const alertDataLoader = useDataLoader(() =>
    biohubApi.alert.getAlerts({ types: alertTypes, expiresAfter: dayjs().format() })
  );

  useEffect(() => {
    alertDataLoader.load();
  }, [alertDataLoader]);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const alerts = alertDataLoader.data?.alerts ?? [];

  const numberOfAlerts = alerts.length;

  const renderAlerts = (alerts: IAlert[]) => {
    const visibleAlerts = [];
    const collapsedAlerts = [];

    for (let index = 0; index < numberOfAlerts; index++) {
      const alert = alerts[index];

      const alertComponent = (
        <AlertBar
          severity={alert.severity}
          text={alert.message}
          title={alert.name}
          key={alert.alert_id}
          variant="outlined"
          {...alertProps}
        />
      );

      if (index < NumberOfAlertsShownInitially) {
        visibleAlerts.push(alertComponent);
      } else {
        collapsedAlerts.push(alertComponent);
      }
    }

    return (
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '& .MuiAlert-root': {
            mb: 1
          }
        }}>
        {visibleAlerts}
        {collapsedAlerts.length > 0 && <Collapse in={isExpanded}>{collapsedAlerts}</Collapse>}
      </Stack>
    );
  };

  if (!numberOfAlerts) {
    return null;
  }

  return (
    <Box>
      {renderAlerts(alerts)}
      {numberOfAlerts > NumberOfAlertsShownInitially && (
        <Button
          variant="text"
          onClick={() => setIsExpanded((prev) => !prev)}
          color="primary"
          startIcon={<Icon path={(isExpanded && mdiChevronUp) || mdiChevronDown} size={0.8} />}>
          <Typography variant="body2" fontWeight={700} color="primary">
            {isExpanded ? (
              <>{'See fewer alerts'}</>
            ) : (
              <>
                {'See more alerts'} &zwnj;
                <Typography component="span" variant="inherit">
                  ({numberOfAlerts - NumberOfAlertsShownInitially})
                </Typography>
              </>
            )}
          </Typography>
        </Button>
      )}
    </Box>
  );
};
