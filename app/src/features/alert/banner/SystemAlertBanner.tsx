import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAlert, SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { useEffect, useState } from 'react';

interface ISystemAlertBannerProps {
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
  const { alertTypes } = props;

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
    <Box mb={3}>
      {renderAlerts(alerts)}
      {numberOfAlerts > NumberOfAlertsShownInitially && (
        <Button
          variant="text"
          onClick={() => setIsExpanded((prev) => !prev)}
          sx={{ color: grey[700] }}
          startIcon={<Icon path={(isExpanded && mdiChevronUp) || mdiChevronDown} size={0.8} />}>
          <Typography variant="body2">
            {isExpanded ? (
              <>{'See fewer alerts'}</>
            ) : (
              <>
                {'See more alerts'} &zwnj;
                <Typography component="span" variant="inherit" color="textSecondary">
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
