import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

export interface IAgreementsForm {
  sedis_procedures_accepted: boolean;
  foippa_requirements_accepted: boolean;
}

export const AgreementsInitialValues: IAgreementsForm = {
  sedis_procedures_accepted: false,
  foippa_requirements_accepted: false
};

export const AgreementsYupSchema = yup.object().shape({
  sedis_procedures_accepted: yup.bool().oneOf([true], 'You must agree to the SEDIS procedures'),
  foippa_requirements_accepted: yup.bool().oneOf([true], 'You must agree to the FOIPPA requirements')
});

/**
 * Create survey - agreements fields
 *
 * @return {*}
 */
const AgreementsForm = () => {
  const classes = useStyles();

  const { errors, touched, values, handleChange, handleSubmit } = useFormikContext<IAgreementsForm>();

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography className={classes.bold}>
            Species and Ecosystems Data and Information Security (SEDIS) Procedures
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            required={true}
            component="fieldset"
            error={touched.sedis_procedures_accepted && Boolean(errors.sedis_procedures_accepted)}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.sedis_procedures_accepted}
                  onChange={handleChange}
                  name="sedis_procedures_accepted"
                  color="primary"
                />
              }
              label="All data and information for this survey will be collected legally, and in accordance with Section 1 of the Species and Ecosystems Data and Information Security (SEDIS) procedures."
            />
            <FormHelperText>{errors.sedis_procedures_accepted}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box pt={4}>
            <Typography className={classes.bold}>
              Freedom of Information and Protection of Privacy Act (FOIPPA) Requirements
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            required={true}
            component="fieldset"
            error={touched.foippa_requirements_accepted && Boolean(errors.foippa_requirements_accepted)}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.foippa_requirements_accepted}
                  onChange={handleChange}
                  name="foippa_requirements_accepted"
                  color="primary"
                />
              }
              label="All data submitted in this survey will meet or exceed the Freedom of Information and Protection of Privacy Act (FOIPPA) requirements."
            />
            <FormHelperText>{errors.foippa_requirements_accepted}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default AgreementsForm;
