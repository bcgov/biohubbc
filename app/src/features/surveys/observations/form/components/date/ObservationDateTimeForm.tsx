import Stack from '@mui/material/Stack';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';

/**
 * Form component for the observation date and time.
 *

 * @return {*}
 */
export const ObservationDateTimeForm = () => {
  return (
    <Stack spacing={2}>
      <SingleDateField label="Date" id="date" name="standardColumns.observation_date" />
      <TimeField label="Time" name="standardColumns.observation_time" id="time" required={false} />
    </Stack>
  );
};
