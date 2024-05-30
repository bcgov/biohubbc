import { mdiCalendar } from '@mdi/js';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import CustomTextField from 'components/fields/CustomTextField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';

export const MortalityGeneralInformationForm = () => {
  const formikProps = useFormikContext<ICreateEditMortalityRequest>();

  console.log('A', formikProps.values);
  console.log('B', formikProps.errors);

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography component="legend" variant="h5" mb={1}>
            Mortality information
          </Typography>
          <Box mt={3}>
            <DateTimeFields
              formikProps={formikProps}
              date={{
                dateLabel: 'Mortality date',
                dateName: 'mortality.mortality_date',
                dateId: 'mortality.mortality_date',
                dateRequired: true,
                dateIcon: mdiCalendar
              }}
              time={{
                timeLabel: 'Mortality time',
                timeName: 'mortality.mortality_time',
                timeId: 'mortality.mortality_time',
                timeRequired: false,
                timeIcon: mdiCalendar
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="mortality.mortality_comment"
            label="Mortality comments"
            maxLength={1000}
            other={{ multiline: true, rows: 4 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
