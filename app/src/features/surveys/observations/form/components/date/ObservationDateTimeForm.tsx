import Stack from '@mui/material/Stack';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';

interface IObservationDateTimeFormProps {
  formikPrefixPath: string;
}

/**
 * Form component for the observation date and time.
 *
 * @param {IObservationDateTimeFormProps} props
 * @return {*}
 */
export const ObservationDateTimeForm = (props: IObservationDateTimeFormProps) => {
  const { formikPrefixPath } = props;

  return (
    <Stack spacing={2}>
      <SingleDateField label="Date" name={`${formikPrefixPath}.observation_date`} />
      <TimeField label="Time" name={`${formikPrefixPath}.observation_time`} id="time" required={false} />
    </Stack>
  );
};
