import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { DateField } from 'components/fields/DateField';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { IAlertCreateObject } from 'interfaces/useAlertApi.interface';
import { useEffect } from 'react';

/**
 * Form used to create and update system alerts, used by system administrators
 *
 */
const AlertForm = () => {
  const codesContext = useCodesContext();

  const { values } = useFormikContext<IAlertCreateObject>();

  const alertTypes = codesContext.codesDataLoader.data?.alert_types ?? [];

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, []);

  const alertTypeOptions = alertTypes.map((type) => ({ value: type.id, label: type.name }));

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
          <AutocompleteField id={'alert_type_id'} name={'alert_type_id'} label={'Type'} required options={alertTypeOptions} />
          <AutocompleteField
            id={'severity'}
            name={'severity'}
            label={'Style'}
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
            <DateField label="End date" name="record_end_date" id="alert-record-end-date" required={false} />
          </Box>
        </Box>
      </form>
      <Box mt={3}>
        <Typography component="legend">Preview</Typography>
        <AlertBar text={values.message} title={values.name} variant="standard" severity={values.severity} />
      </Box>
    </>
  );
};

export default AlertForm;
