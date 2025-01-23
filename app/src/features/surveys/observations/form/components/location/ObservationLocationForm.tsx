import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';

interface IObservationLocationFormProps {
  formikPrefixPath: string;
}

/**
 * Form component for the observation location.
 *
 * @param {IObservationLocationFormProps} props
 * @return {*}
 */
export const ObservationLocationForm = (props: IObservationLocationFormProps) => {
  const { formikPrefixPath } = props;

  return (
    <Stack spacing={2}>
      <CustomTextField label="Latitude" name={`${formikPrefixPath}.latitude`} other={{ type: 'number' }} />
      <CustomTextField label="Longitude" name={`${formikPrefixPath}.longitude`} other={{ type: 'number' }} />
    </Stack>
  );
};
