import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';

const CauseOfDeathForm = () => {
  
  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="mortality.mortality_comment"
            label="Notes"
            maxLength={1000}
            other={{ multiline: true, rows: 4 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CauseOfDeathForm;
