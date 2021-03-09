import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import * as yup from 'yup';

export interface IProjectPermitFormArrayItem {
  permit_number: string;
  sampling_conducted: string;
}

export interface IProjectPermitForm {
  permits: IProjectPermitFormArrayItem[];
}

export const ProjectPermitFormArrayItemInitialValues: IProjectPermitFormArrayItem = {
  permit_number: '',
  sampling_conducted: 'false'
};

export const ProjectPermitFormInitialValues: IProjectPermitForm = {
  permits: [ProjectPermitFormArrayItemInitialValues]
};

export const ProjectPermitFormYupSchema = yup.object().shape({
  permits: yup.array().of(
    yup.object().shape({
      permit_number: yup.string().required('Required'),
      sampling_conducted: yup.string().required('Required')
    })
  )
});

/**
 * Create project - Permit section
 *
 * @return {*}
 */
const ProjectPermitForm: React.FC = () => {
  const { values, handleChange, handleSubmit, getFieldMeta } = useFormikContext<IProjectPermitForm>();

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="permits"
        render={(arrayHelpers) => (
          <Box>
            <Box mb={2}>
              {values.permits.map((permit, index) => {
                const permitNumberMeta = getFieldMeta(`permits.[${index}].permit_number`);
                const samplingConductedMeta = getFieldMeta(`permits.[${index}].sampling_conducted`);
                return (
                  <Grid container spacing={3} direction="row" key={index}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required={true}
                        id={`permits.[${index}].permit_number`}
                        name={`permits.[${index}].permit_number`}
                        label="Permit Number"
                        variant="outlined"
                        value={permit.permit_number}
                        onChange={handleChange}
                        error={permitNumberMeta.touched && Boolean(permitNumberMeta.error)}
                        helperText={permitNumberMeta.error}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl variant="outlined" style={{ width: '100%' }}>
                        <InputLabel id="sampling_conducted">Sampling Conducted</InputLabel>
                        <Select
                          id={`permits.[${index}].sampling_conducted`}
                          name={`permits.[${index}].sampling_conducted`}
                          labelId="sampling_conducted"
                          label="Sampling Conducted"
                          value={permit.sampling_conducted}
                          onChange={handleChange}
                          error={samplingConductedMeta.touched && Boolean(samplingConductedMeta.error)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Investment Category' }}>
                          <MenuItem key={1} value="false">
                            No
                          </MenuItem>
                          <MenuItem key={2} value="true">
                            Yes
                          </MenuItem>
                        </Select>
                        <FormHelperText>{samplingConductedMeta.error}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <IconButton aria-label="delete" onClick={() => arrayHelpers.remove(index)}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
            </Box>
            <Box>
              <Button
                type="button"
                variant="outlined"
                aria-label="add another"
                onClick={() => arrayHelpers.push(ProjectPermitFormArrayItemInitialValues)}>
                Add Another
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default ProjectPermitForm;
