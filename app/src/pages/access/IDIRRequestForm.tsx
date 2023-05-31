import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { IIDIRAccessRequestDataObject } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';

export const IDIRRequestFormInitialValues: IIDIRAccessRequestDataObject = {
  role: ('' as unknown) as number,
  reason: ''
};

export const IDIRRequestFormYupSchema = yup.object().shape({
  role: yup.string().required('Required'),
  reason: yup.string().max(300, 'Maximum 300 characters')
});

export interface IIDIRRequestFormProps {
  codes?: IGetAllCodeSetsResponse;
}

/**
 * Access Request - IDIR request fields
 *
 * @return {*}
 */
const IDIRRequestForm: React.FC<IIDIRRequestFormProps> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<IIDIRAccessRequestDataObject>();
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
      </Grid>

      <Box mt={3}>
        <Typography variant="h3">
          Why are you requesting access to Species Inventory Management System (SIMS)?
        </Typography>
        <Box mt={2}>
          <CustomTextField name="reason" label="Reason" other={{ multiline: true, rows: 4 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default IDIRRequestForm;
