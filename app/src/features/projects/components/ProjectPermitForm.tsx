import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import yup from 'utils/YupSchema';

export interface IProjectPermitFormArrayItem {
  permit_number: string;
  sampling_conducted: string;
}

export interface IProjectPermitForm {
  permits: IProjectPermitFormArrayItem[];
}

export const ProjectPermitFormArrayItemInitialValues: IProjectPermitFormArrayItem = {
  permit_number: '',
  sampling_conducted: 'true'
};

export const ProjectPermitFormInitialValues: IProjectPermitForm = {
  permits: []
};

export const ProjectPermitFormYupSchema = yup.object().shape({
  permits: yup
    .array()
    .of(
      yup.object().shape({
        permit_number: yup.string().max(100, 'Cannot exceed 100 characters').required('Required'),
        sampling_conducted: yup.string().required('Required')
      })
    )
    .isUniquePermitNumber('Permit numbers must be unique')
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
  const { values, handleChange, handleSubmit, getFieldMeta, errors } = useFormikContext<IProjectPermitForm>();

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
                        <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
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
                            inputProps={{ 'aria-label': 'sampling conducted', 'data-testid': 'sampling_conducted' }}>
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
                        <IconButton
                          color="primary"
                          data-testid="delete-icon"
                          aria-label="remove permit"
                          onClick={() => arrayHelpers.remove(index)}>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            {errors?.permits && !Array.isArray(errors?.permits) && (
              <Box pt={2}>
                <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.permits}</Typography>
              </Box>
            )}
            <Box pt={2}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                aria-label="add permit"
                onClick={() => arrayHelpers.push(ProjectPermitFormArrayItemInitialValues)}>
                Add Permit
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default ProjectPermitForm;
