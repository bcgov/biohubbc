import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { DateField } from 'components/fields/DateField';

const AlertForm = () => {
  return (
    <form>
      <Box>
        <Box component={'fieldset'} mb={4}>
          <Typography component="legend">Name and Message</Typography>
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
          <CustomTextField
            name="type"
            label="type"
            maxLength={250}
            other={{ multiline: true, placeholder: 'Maximum 250 characters', required: true, rows: 3 }}
          />
        </Box>
        <Box component={'fieldset'}>
          <Typography component="legend">End date (optional)</Typography>
          <Box mt={0.5}>
            <DateField label='End date' name='record_end_date' id='alert-record-end-date' required={false}/>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default AlertForm;
