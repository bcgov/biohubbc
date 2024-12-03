import Stack from '@mui/material/Stack';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';

interface IObservationDateTimeFormProps {
  formikFieldName: string;
}

const ObservationDateTimeForm = (props: IObservationDateTimeFormProps) => {
  const { formikFieldName } = props;

  return (
    <Stack spacing={2}>
      <SingleDateField label="Date" name={`${formikFieldName}.observation_date`} />
      <TimeField label="Time" name={`${formikFieldName}.observation_time`} id="time" required={false} />
    </Stack>
  );
};

export default ObservationDateTimeForm;
