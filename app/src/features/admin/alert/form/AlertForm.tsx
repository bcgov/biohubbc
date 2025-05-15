import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { useFormikContext } from 'formik';
import { IAlertCreateObject } from 'interfaces/useAlertApi.interface';

interface IAlertFormProps {
  alertTypeOptions: IAutocompleteFieldOption<number>[];
}

/**
 * Form used to create and update system alerts, used by system administrators
 *
 */
const AlertForm = (props: IAlertFormProps) => {
  const { alertTypeOptions } = props;

  const { values } = useFormikContext<IAlertCreateObject>();

  return (
    <>
      <form>
        <Box component={'fieldset'} mb={4}>
          <Typography component="legend">Display information</Typography>
          <Box mt={0.5} mb={3}>
            <CustomTextField
              name="name"
              label="Name"
              maxLength={50}
              other={{ placeholder: 'Maximum 50 characters', required: true }}
            />
          </Box>
          <CustomTextField
            name="message"
            label="Message"
            maxLength={250}
            other={{ multiline: true, placeholder: 'Maximum 250 characters', required: true, rows: 3 }}
          />
        </Box>
        <Stack gap={1} mt={0.5} mb={3} display="flex" direction="row">
          <AutocompleteField
            id={'alert_type_id'}
            name={'alert_type_id'}
            label={'Page'}
            required
            options={alertTypeOptions}
          />
          <AutocompleteField
            id={'severity'}
            name={'severity'}
            label={'Style'}
            disableClearable
            required
            options={[
              { value: 'error', label: 'Error' },
              { value: 'info', label: 'Information' },
              { value: 'success', label: 'Success' },
              { value: 'warning', label: 'Warning' }
            ]}
          />
        </Stack>
        <Box component={'fieldset'}>
          <Typography component="legend">Expiry date (optional)</Typography>
          <Box mt={0.5}>
            <SingleDateField label="End date" name="record_end_date" id="record_end_date" required={false} />
          </Box>
        </Box>
      </form>
      <Box mt={3}>
        <Typography component="legend">Preview</Typography>
        <AlertBar text={values.message} title={values.name} variant="outlined" severity={values.severity} />
      </Box>
    </>
  );
};

export default AlertForm;
