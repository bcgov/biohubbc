import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { useFormikContext } from 'formik';
import React from 'react';
import { StringBoolean } from 'types/misc';
import yup from 'utils/YupSchema';

const useStyles = makeStyles({
  agreementInput: {
    alignItems: 'flex-start',
    maxWidth: '92ch',
    '& label': {
      alignItems: 'flex-start'
    },
    '& .MuiButtonBase-root': {
      marginTop: '-6px',
      marginRight: '0.5rem'
    }
  }
});

export interface IAgreementsForm {
  agreements: {
    sedis_procedures_accepted: StringBoolean;
    foippa_requirements_accepted: StringBoolean;
  };
}

export const AgreementsInitialValues: IAgreementsForm = {
  agreements: {
    sedis_procedures_accepted: 'false',
    foippa_requirements_accepted: 'false'
  }
};

export const AgreementsYupSchema = yup.object().shape({
  agreements: yup.object().shape({
    sedis_procedures_accepted: yup.string().oneOf(['true'], 'You must agree to the SEDIS procedures'),
    foippa_requirements_accepted: yup.string().oneOf(['true'], 'You must agree to the FOIPPA requirements')
  })
});

/**
 * Create survey - agreements fields
 *
 * @return {*}
 */
const AgreementsForm = () => {
  const classes = useStyles();

  const { errors, touched, values, setFieldValue } = useFormikContext<IAgreementsForm>();

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography component="h3" variant="h5">
            Species and Ecosystems Data and Information Security (SEDIS) Procedures
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            className={classes.agreementInput}
            required={true}
            component="fieldset"
            error={
              touched.agreements?.sedis_procedures_accepted && errors.agreements?.sedis_procedures_accepted === 'true'
                ? true
                : false
            }>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.agreements?.sedis_procedures_accepted === 'true' ? true : false}
                  onChange={() =>
                    setFieldValue(
                      'agreements.sedis_procedures_accepted',
                      values.agreements?.sedis_procedures_accepted === 'true' ? 'false' : 'true'
                    )
                  }
                  name="agreements.sedis_procedures_accepted"
                  color="primary"
                />
              }
              label="All data and information for this survey will be collected legally, and in accordance with Section 1 of the Species and Ecosystems Data and Information Security (SEDIS) procedures."
            />
            <FormHelperText>{errors.agreements?.sedis_procedures_accepted}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box>
            <Typography component="h3" variant="h5">
              Freedom of Information and Protection of Privacy Act (FOIPPA) Requirements
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <FormControl
            className={classes.agreementInput}
            required={true}
            component="fieldset"
            error={
              touched.agreements?.foippa_requirements_accepted &&
              errors.agreements?.foippa_requirements_accepted === 'true'
                ? true
                : false
            }>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.agreements?.foippa_requirements_accepted === 'true' ? true : false}
                  onChange={() =>
                    setFieldValue(
                      'agreements.foippa_requirements_accepted',
                      values.agreements?.foippa_requirements_accepted === 'true' ? 'false' : 'true'
                    )
                  }
                  name="agreements.foippa_requirements_accepted"
                  color="primary"
                />
              }
              label="All data submitted in this survey will meet or exceed the Freedom of Information and Protection of Privacy Act (FOIPPA) requirements."
            />
            <FormHelperText>{errors.agreements?.foippa_requirements_accepted}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default AgreementsForm;
