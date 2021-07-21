import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectPermitFormArrayItem {
  permit_number: string;
  permit_type: string;
}

export interface IProjectExistingPermitFormArrayItem {
  permit_id: number;
}

export interface IProjectPermitForm {
  permits: IProjectPermitFormArrayItem[];
  existing_permits?: IProjectExistingPermitFormArrayItem[];
}

export const ProjectPermitFormArrayItemInitialValues: IProjectPermitFormArrayItem = {
  permit_number: '',
  permit_type: ''
};

export const ProjectPermitFormInitialValues: IProjectPermitForm = {
  permits: [],
  existing_permits: []
};

export const ProjectPermitFormYupSchema = yup.object().shape({
  permits: yup
    .array()
    .of(
      yup.object().shape({
        permit_number: yup.string().max(100, 'Cannot exceed 100 characters').required('Required'),
        permit_type: yup.string().required('Required')
      })
    )
    .isUniquePermitNumber('Permit numbers must be unique')
});

export const ProjectPermitEditFormYupSchema = yup.object().shape({
  permits: yup
    .array()
    .of(
      yup.object().shape({
        permit_number: yup.string().max(100, 'Cannot exceed 100 characters').required('Required'),
        permit_type: yup.string().required('Required')
      })
    )
    .isUniquePermitNumber('Permit numbers must be unique')
});

export interface IProjectPermitFormProps {
  non_sampling_permits?: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Permit section
 *
 * @return {*}
 */
const ProjectPermitForm: React.FC<IProjectPermitFormProps> = (props) => {
  const { values, handleChange, handleSubmit, getFieldMeta, errors } = useFormikContext<IProjectPermitForm>();

  return (
    <form onSubmit={handleSubmit}>
      {props.non_sampling_permits && props.non_sampling_permits.length > 0 && (
        <Box pb={4}>
          <MultiAutocompleteFieldVariableSize
            id="existing_permits"
            label="Select Existing Permits"
            options={props.non_sampling_permits}
            required={false}
          />
        </Box>
      )}
      <FieldArray
        name="permits"
        render={(arrayHelpers) => (
          <Box>
            <Grid container direction="row" spacing={3}>
              {values.permits?.map((permit, index) => {
                const permitNumberMeta = getFieldMeta(`permits.[${index}].permit_number`);
                const permitTypeMeta = getFieldMeta(`permits.[${index}].permit_type`);

                return (
                  <Grid item xs={12} key={index}>
                    <Box display="flex">
                      <Box flexBasis="45%" pr={1}>
                        <CustomTextField
                          name={`permits.[${index}].permit_number`}
                          label="Permit Number"
                          other={{
                            required: true,
                            value: permit.permit_number,
                            error: permitNumberMeta.touched && Boolean(permitNumberMeta.error),
                            helperText: permitNumberMeta.touched && permitNumberMeta.error
                          }}
                        />
                      </Box>
                      <Box flexBasis="55%" pl={1}>
                        <FormControl variant="outlined" required={true} style={{ width: '100%' }}>
                          <InputLabel id="permit_type">Permit Type</InputLabel>
                          <Select
                            id={`permits.[${index}].permit_type`}
                            name={`permits.[${index}].permit_type`}
                            labelId="permit_type"
                            label="Permit Type"
                            value={permit.permit_type}
                            onChange={handleChange}
                            error={permitTypeMeta.touched && Boolean(permitTypeMeta.error)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Permit Type' }}>
                            <MenuItem key={1} value="Park Use Permit">
                              Park Use Permit
                            </MenuItem>
                            <MenuItem key={2} value="Wildlife Permit - General">
                              Wildlife Permit - General
                            </MenuItem>
                            <MenuItem key={3} value="Scientific Fish Collection Permit">
                              Scientific Fish Collection Permit
                            </MenuItem>
                          </Select>
                          <FormHelperText>{permitTypeMeta.touched && permitTypeMeta.error}</FormHelperText>
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
                Add New Permit
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default ProjectPermitForm;
