import { mdiArrowRightThin } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT, TIME_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useEffect } from 'react';

interface ISurveyDeploymentListItemDetailsProps {
  deployment: Omit<IAnimalDeployment, 'frequency_unit'> & { frequency_unit: string | null };
}

/**
 * Renders information about a single telemetry deployment such as start and end dates
 *
 * @param props {ISurveyDeploymentListItemDetailsProps}
 * @returns
 */
export const SurveyDeploymentListItemDetails = (props: ISurveyDeploymentListItemDetailsProps) => {
  const { deployment } = props;
  const critterbaseApi = useCritterbaseApi();

  // TODO: Make these API calls in the parent as once call, then pass data as props
  const startCaptureDataLoader = useDataLoader((captureId: string) => critterbaseApi.capture.getCapture(captureId));
  const endCaptureDataLoader = useDataLoader((captureId: string) => critterbaseApi.capture.getCapture(captureId));
  const endMortalityDataLoader = useDataLoader((mortalityId: string) =>
    critterbaseApi.mortality.getMortality(mortalityId)
  );

  useEffect(() => {
    startCaptureDataLoader.load(deployment.critterbase_start_capture_id);
    if (deployment.critterbase_end_capture_id) {
      endCaptureDataLoader.load(deployment.critterbase_end_capture_id);
    }
    if (deployment.critterbase_end_mortality_id) {
      endMortalityDataLoader.load(deployment.critterbase_end_mortality_id);
    }
  }, [startCaptureDataLoader, endCaptureDataLoader, endMortalityDataLoader, deployment]);

  const endCapture = endCaptureDataLoader.data;
  const endMortality = endMortalityDataLoader.data;

  const endDate = endCapture?.capture_date || endMortality?.mortality_timestamp || deployment.attachment_end_date;

  const endDateFormatted = endDate ? dayjs(endDate).format(DATE_FORMAT.MediumDateFormat) : null;

  if (!startCaptureDataLoader.data) {
    return <Skeleton width="100%" height="55px" />;
  }

  const startDate = dayjs(startCaptureDataLoader.data.capture_date).format(DATE_FORMAT.MediumDateFormat);
  const startTime = startCaptureDataLoader.data.capture_time;

  const endTime =
    endCapture?.capture_time ||
    (endMortality?.mortality_timestamp &&
      dayjs(endMortality?.mortality_timestamp).format(TIME_FORMAT.LongTimeFormat24Hour)) ||
    deployment.attachment_end_time;

  return (
    <Box width="100%" display="flex" justifyContent="space-between" p={0}>
      <Box>
        <Typography component="dt" variant="subtitle2" color="textSecondary">
          {startDate}
        </Typography>
        <Typography component="dt" variant="subtitle2" color="textSecondary">
          {startTime}
        </Typography>
      </Box>
      {endDateFormatted && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', mx: 1, mt: -0.25 }}>
            <Icon path={mdiArrowRightThin} size={1} color={grey[500]} />
          </Box>
          <Box flex="1 1 auto">
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              {endDateFormatted}
            </Typography>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              {endTime}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};
