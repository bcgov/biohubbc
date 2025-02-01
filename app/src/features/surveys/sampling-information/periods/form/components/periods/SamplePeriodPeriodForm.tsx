import { mdiArrowRightThin, mdiCalendarMonthOutline, mdiClockOutline, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { v4 } from 'uuid';

export interface ISurveySamplePeriodPeriodFormData {
  // Temporary id used as the unique key on the frontend, not to be sent to the backend
  id?: string;
  // Data for the request
  survey_sample_period_id?: number | null; // Will be null for new periods, and a number for existing periods
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
}

export const InitialSurveySamplePeriodPeriodFormData: ISurveySamplePeriodPeriodFormData = {
  id: v4(),
  survey_sample_period_id: null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: ''
};

interface ISamplePeriodPeriodFormProps {
  index: number;
  isDeleteDisabled?: boolean;
  onDelete?: () => void;
}

export const SamplePeriodPeriodForm = (props: ISamplePeriodPeriodFormProps) => {
  const { index, isDeleteDisabled, onDelete } = props;

  const formikProps = useFormikContext<ISurveySamplePeriodPeriodFormData>();

  return (
    <Box component={Stack} flexDirection="row" gap={1}>
      <Box component={Stack} flexDirection="row" gap={1}>
        {/* Start Date/Time Fields */}
        <Stack>
          <DateTimeFields
            date={{
              dateLabel: 'Start Date',
              dateName: `sample_periods.[${index}].start_date`,
              dateId: `start_date_${index}`,
              dateRequired: true,
              dateIcon: mdiCalendarMonthOutline
            }}
            time={{
              timeLabel: '',
              timeName: `sample_periods.[${index}].start_time`,
              timeId: `start_time_${index}`,
              timeRequired: false,
              timeIcon: mdiClockOutline
            }}
            formikProps={formikProps}
          />
        </Stack>

        {/* Arrow Separator */}
        <Box flex="0 0 auto" mt={2.25}>
          <Icon path={mdiArrowRightThin} size={1} />
        </Box>

        {/* End Date/Time Fields */}
        <Stack>
          <DateTimeFields
            date={{
              dateLabel: 'End Date',
              dateName: `sample_periods.[${index}].end_date`,
              dateId: `end_date_${index}`,
              dateRequired: true,
              dateIcon: mdiCalendarMonthOutline
            }}
            time={{
              timeLabel: '',
              timeName: `sample_periods.[${index}].end_time`,
              timeId: `end_time_${index}`,
              timeRequired: false,
              timeIcon: mdiClockOutline
            }}
            formikProps={formikProps}
          />
        </Stack>
      </Box>

      {/* Remove Button */}
      {onDelete && !isDeleteDisabled && (
        <Box mt={1}>
          <IconButton onClick={() => onDelete()}>
            <Icon path={mdiClose} size={1} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
