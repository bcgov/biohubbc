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
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import * as yup from 'yup';

export interface IProjectPermitFormArrayItem {
  permit_number: number;
  sampling_conducted: string;
}

export interface IProjectPermitForm {
  permits: IProjectPermitFormArrayItem[];
}

export const ProjectPermitFormArrayItemInitialValues: IProjectPermitFormArrayItem = {
  permit_number: ('' as unknown) as number,
  sampling_conducted: 'false'
};

export const ProjectPermitFormInitialValues: IProjectPermitForm = {
  permits: [ProjectPermitFormArrayItemInitialValues]
};

export const ProjectPermitFormYupSchema = yup.object().shape({
  permits: yup.array().of(
    yup.object().shape({
      permit_number: yup
        .number()
        .transform((value) => (isNaN(value) && null) || value)
        .typeError('Must be a number')
        .min(0, 'Must be a positive number')
        .required('Required'),
      sampling_conducted: yup.string().required('Required')
    })
  )
});

export interface IProjectPermitFormProps {
  /**
   * Emits every time a form value changes.
   */
  onValuesChange?: (values: IProjectPermitForm) => void;
}

/**
 * Create project - Permit section
 *
 * @return {*}
 */
const ProjectPermitForm: React.FC<IProjectPermitFormProps> = (props) => {
  const { values, handleChange, handleSubmit, getFieldMeta } = useFormikContext<IProjectPermitForm>();

  useEffect(() => {
    props?.onValuesChange?.(values);
  }, [values, props]);

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="permits"
        render={(arrayHelpers) => (
          <Box>
            <Grid container direction="row" spacing={3}>
              {values.permits?.map((permit, index) => {
                const permitNumberMeta = getFieldMeta(`permits.[${index}].permit_number`);
                const samplingConductedMeta = getFieldMeta(`permits.[${index}].sampling_conducted`);
                return (
                  <Grid item xs={12} key={index}>
                    <Box display="flex">
                      <Box flexBasis="70%" pr={1}>
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
                      </Box>
                      <Box flexBasis="30%" pl={1}>
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
                      </Box>
                      <Box pt={0.5} pl={1}>
                        <IconButton color="primary" aria-label="delete" onClick={() => arrayHelpers.remove(index)}>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            <Box pt={2}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                aria-label="Add Another"
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
