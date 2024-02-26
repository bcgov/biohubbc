import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import {
  IBCeIDBasicAccessRequestDataObject,
  IBCeIDBusinessAccessRequestDataObject
} from 'interfaces/useAdminApi.interface';
import yup from 'utils/YupSchema';

interface IBCeIDRequestFormProps {
  accountType: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC | SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS;
}

export const BCeIDBasicRequestFormInitialValues: IBCeIDBasicAccessRequestDataObject = {
  reason: ''
};

export const BCeIDBusinessRequestFormInitialValues: IBCeIDBusinessAccessRequestDataObject = {
  company: '',
  reason: ''
};

export const BCeIDBasicRequestFormYupSchema = yup.object().shape({
  reason: yup.string().max(300, 'Maximum 300 characters')
});

export const BCeIDBusinessRequestFormYupSchema = yup.object().shape({
  company: yup.string().required('Required'),
  reason: yup.string().max(300, 'Maximum 300 characters')
});

/**
 * Access Request - BCeID request fields
 *
 * @param {IBCeIDRequestFormProps} props
 * @return {*}
 */
const BCeIDRequestForm = (props: IBCeIDRequestFormProps) => {
  return (
    <Box>
      <Grid container spacing={3}>
        {props.accountType === SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS && (
          <Grid item xs={12}>
            <h3>Company Name</h3>
            <CustomTextField
              name="company"
              label="Company Name"
              other={{
                required: true
              }}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <CustomTextField name="reason" label="Reason For Request" other={{ multiline: true, rows: 4 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BCeIDRequestForm;
