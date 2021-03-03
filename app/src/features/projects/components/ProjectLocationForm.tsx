import { Grid, TextField } from '@material-ui/core';
import {
  default as MultiAutocompleteFieldVariableSize,
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import * as yup from 'yup';

export interface IProjectLocationForm {
  regions: string[];
  location_description: string;
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  regions: [],
  location_description: ''
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  regions: yup.array().of(yup.string()).min(1).required('Required'),
  location_description: yup.string()
});

export interface IProjectLocationFormProps {
  region: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm: React.FC<IProjectLocationFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectLocationForm>();

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'regions'}
            label={'Regions'}
            options={props.region}
            required={true}
            formikProps={formikProps}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="location_description"
            name="location_description"
            label="Location Description"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={values.location_description}
            onChange={handleChange}
            error={touched.location_description && Boolean(errors.location_description)}
            helperText={errors.location_description}
            InputLabelProps={{
              shrink: true
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectLocationForm;
