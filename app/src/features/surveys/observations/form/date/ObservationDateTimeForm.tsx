import Stack from '@mui/material/Stack';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';

interface IObservationDateTimeFormProps {
  formikSectionName: string;
}

const ObservationDateTimeForm = (props: IObservationDateTimeFormProps) => {
  const { formikSectionName } = props;

  return (
    <Stack spacing={2}>
      <SingleDateField label="Date" name={`${formikSectionName}.observation_date`} />
      <TimeField label="Time" name={`${formikSectionName}.observation_time`} id="time" required={false} />
    </Stack>
  );
};

export default ObservationDateTimeForm;
