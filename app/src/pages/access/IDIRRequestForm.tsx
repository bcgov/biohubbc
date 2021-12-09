import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IIDIRRequestForm {
  role: number;
  work_from_regional_office: string;
  regional_offices: number[];
  comments: string;
}

export const IDIRRequestFormInitialValues: IIDIRRequestForm = {
  role: ('' as unknown) as number,
  work_from_regional_office: '',
  regional_offices: [],
  comments: ''
};

export const IDIRRequestFormYupSchema = yup.object().shape({
  role: yup.string().required('Required'),
  // work_from_regional_office: yup.string().required('Required'), // TODO Release 1 Patch (BHBC-1442): Remove field validation
  // regional_offices: yup
  //   .array()
  //   .when('work_from_regional_office', { is: 'true', then: yup.array().min(1, 'Required').required('Required') }), // TODO Release 1 Patch (BHBC-1442): Remove field validation
  comments: yup.string().max(300, 'Maximum 300 characters')
});

export interface IIDIRRequestFormProps {
  codes?: IGetAllCodeSetsResponse;
}

const useStyles = makeStyles((theme: Theme) => ({
  legend: {
    marginTop: '1rem',
    float: 'left',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01rem'
  }
}));

/**
 * Access Request - IDIR request fields
 *
 * @return {*}
 */
const IDIRRequestForm: React.FC<IIDIRRequestFormProps> = (props) => {
  const classes = useStyles();
  const { values, touched, errors, setFieldValue, handleChange } = useFormikContext<IIDIRRequestForm>();
  const { codes } = props;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3">What role do you want to be assigned?</Typography>
          <Box mt={2}>
            <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                id="role"
                name="role"
                labelId="role-label"
                label="Role"
                value={values.role}
                labelWidth={300}
                onChange={handleChange}
                error={touched.role && Boolean(errors.role)}
                displayEmpty
                inputProps={{ 'aria-label': 'Role' }}>
                {codes?.system_roles.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.role}</FormHelperText>
            </FormControl>
          </Box>
        </Grid>

        {false && ( // TODO Release 1 Patch (BHBC-1442): Remove regional offices section
          <Grid item xs={12}>
            <FormControl
              required={true}
              component="fieldset"
              onChange={(event: any) => {
                if (event.target.value === 'false') {
                  setFieldValue('regional_offices', []);
                }
              }}
              error={touched.work_from_regional_office && Boolean(errors.work_from_regional_office)}>
              <FormLabel component="legend" className={classes.legend}>
                Do you work for a Regional Office?
              </FormLabel>
              <Box mt={2}>
                <RadioGroup
                  name="work_from_regional_office"
                  aria-label="work_from_regional_office"
                  value={values.work_from_regional_office}
                  onChange={handleChange}>
                  <FormControlLabel
                    value="true"
                    data-testid="yes-regional-office"
                    control={<Radio required={true} color="primary" />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="false"
                    data-testid="no-regional-office"
                    control={<Radio required={true} color="primary" />}
                    label="No"
                  />
                  <FormHelperText>{errors.work_from_regional_office}</FormHelperText>
                </RadioGroup>
              </Box>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {values.work_from_regional_office === 'true' && (
        <Box>
          <Typography variant="h3">Which Regional Offices do you work for?</Typography>
          <MultiAutocompleteFieldVariableSize
            id={'regional_offices'}
            label={'Regional Offices'}
            options={
              codes?.regional_offices?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
          />
        </Box>
      )}

      <Box mt={3}>
        <Typography variant="h3">Reason for your request</Typography>
        <Box mt={2}>
          <CustomTextField name="Reason" label="Reason" other={{ multiline: true, rows: 4 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default IDIRRequestForm;
