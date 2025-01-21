import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';

interface IObservationLocationFormProps {
  formikSectionName: string;
}

const ObservationLocationForm = (props: IObservationLocationFormProps) => {
  const { formikSectionName } = props;

  return (
    <Stack spacing={2}>
      <CustomTextField label="Latitude" name={`${formikSectionName}.latitude`} other={{ type: 'number' }} />
      <CustomTextField label="Longitude" name={`${formikSectionName}.longitude`} other={{ type: 'number' }} />
    </Stack>
  );
};

export default ObservationLocationForm;
