import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAlert } from 'interfaces/useAlertApi.interface';
import { useEffect, useState } from 'react';

export enum SystemAlertBannerEnum {
  SUMMARY = 'Summary',
  TELEMETRY = 'Manage Telemetry',
  OBSERVATIONS = 'Manage Observations',
  ANIMALS = 'Manage Animals',
  SAMPLING = 'Manage Sampling',
  PROJECTS = 'Projects',
  SURVEYS = 'Surveys',
  STANDARDS = 'Standards',
  ADMINISTRATOR = 'Administrator',
  FUNDING = 'Funding'
}

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
          variant="standard"
        />
      );

      if (index < NumberOfAlertsShownInitially) {
        visibleAlerts.push(alertComponent);
      } else {
        collapsedAlerts.push(alertComponent);
      }
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '& .MuiAlert-root': {
            mb: 1
          }
        }}>
        {visibleAlerts}
        {collapsedAlerts.length > 0 && <Collapse in={isExpanded}>{collapsedAlerts}</Collapse>}
      </Box>
    );
  };

  if (!numberOfAlerts) {
    return null;
  }

  return (
    <Box component={Paper} mb={3}>
      <Box p={1}>
        {renderAlerts(alerts)}
        {numberOfAlerts > NumberOfAlertsShownInitially && (
          <Button
            variant="text"
            onClick={() => setIsExpanded((prev) => !prev)}
            sx={{ color: grey[700] }}
            startIcon={<Icon path={(isExpanded && mdiChevronUp) || mdiChevronDown} size={0.8} />}>
            <Typography>
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
    </Box>
  );
};
