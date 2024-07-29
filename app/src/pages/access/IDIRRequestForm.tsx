import Box from '@mui/material/Box';
import CustomTextField from 'components/fields/CustomTextField';
import { IIDIRAccessRequestDataObject } from 'interfaces/useAdminApi.interface';
import yup from 'utils/YupSchema';

export const IDIRRequestFormInitialValues: IIDIRAccessRequestDataObject = {
  reason: ''
};

export const IDIRRequestFormYupSchema = yup.object().shape({
  reason: yup.string().max(300, 'Maximum 300 characters')
});

/**
 * Access Request - IDIR request fields
 *
 * @return {*}
 */
const IDIRRequestForm = () => {
  return (
    <Box>
      <Box mt={3}>
        <Box mt={2}>
          <CustomTextField name="reason" label="Reason for Request" other={{ multiline: true, rows: 4 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default IDIRRequestForm;
