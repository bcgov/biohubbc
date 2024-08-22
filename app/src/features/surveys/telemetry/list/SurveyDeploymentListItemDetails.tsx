import { mdiArrowRightThin } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useEffect } from 'react';

const dateSx = {
  fontSize: '0.85rem',
  color: 'textSecondary'
};

const timeSx = {
  fontSize: '0.85rem',
  color: 'text.secondary'
};

interface ISurveyDeploymentListItemDetailsProps {
  deployment: Omit<IAnimalDeployment, 'frequency_unit'> & { frequency_unit: string | null };
}

export const SurveyDeploymentListItemDetails = (props: ISurveyDeploymentListItemDetailsProps) => {
  const { deployment } = props;
  const critterbaseApi = useCritterbaseApi();

  const captureDataLoader = useDataLoader(() =>
    critterbaseApi.capture.getCapture(deployment.critterbase_start_capture_id)
  );

  useEffect(() => {
    captureDataLoader.load();
  }, [captureDataLoader]);

  if (!captureDataLoader.data) {
    return <Skeleton width="100%" height="55px" />;
  }

  const start_date = dayjs(captureDataLoader.data.capture_date).format(DATE_FORMAT.MediumDateFormat);
  const start_time = captureDataLoader.data.capture_time;
  const end_date = dayjs(captureDataLoader.data.capture_date).format(DATE_FORMAT.MediumDateFormat);
  const end_time = captureDataLoader.data.capture_time;

  return (
    <Box width="100%" display="flex" justifyContent="space-between" p={0}>
      <Box>
        <Typography component="dt" variant="subtitle2" sx={dateSx}>
          {start_date}
        </Typography>
        <Typography component="dt" variant="subtitle2" sx={timeSx}>
          {start_time}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mx: 1, mt: -0.25 }}>
        <Icon path={mdiArrowRightThin} size={1} color={grey[500]} />
      </Box>
      <Box flex="1 1 auto">
        <Typography component="dt" variant="subtitle2" sx={dateSx}>
          {end_date}
        </Typography>
        <Typography component="dt" variant="subtitle2" sx={timeSx}>
          {end_time}
        </Typography>
      </Box>
    </Box>
  );
};
