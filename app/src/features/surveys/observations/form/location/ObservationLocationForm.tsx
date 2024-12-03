import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';

interface IObservationLocationFormProps {
  formikFieldName: string;
}

const ObservationLocationForm = (props: IObservationLocationFormProps) => {
  const { formikFieldName } = props;

  return (
    <Stack spacing={2}>
      <CustomTextField label="Latitude" name={`${formikFieldName}.latitude`} other={{ type: 'number' }} />
      <CustomTextField label="Longitude" name={`${formikFieldName}.longitude`} other={{ type: 'number' }} />
    </Stack>
  );
};

export default ObservationLocationForm;
