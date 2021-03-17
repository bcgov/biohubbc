import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import { getEndDateStringValidator, getStartDateStringValidator } from 'utils/YupValidations';
import * as yup from 'yup';

export interface IProjectDetailsForm {
  project_name: string;
  project_type: string;
  project_type_name?: string;
  project_activities: number[];
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
}

export const ProjectDetailsFormInitialValues: IProjectDetailsForm = {
  project_name: '',
  project_type: '',
  project_activities: [],
  climate_change_initiatives: [],
  start_date: '',
  end_date: ''
};

export const ProjectDetailsFormYupSchema = yup.object().shape({
  project_name: yup.string().required('Required'),
  project_type: yup.string().required('Required'),
  start_date: getStartDateStringValidator().required('Required'),
  end_date: getEndDateStringValidator('start_date')
});

export interface IProjectDetailsFormProps {
  project_type: IMultiAutocompleteFieldOption[];
  activity: IMultiAutocompleteFieldOption[];
  climate_change_initiative: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectDetailsForm: React.FC<IProjectDetailsFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectDetailsForm>();

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required={true}
            id="project_name"
            name="project_name"
            label="Project Name"
            variant="outlined"
            value={values.project_name}
            onChange={handleChange}
            error={touched.project_name && Boolean(errors.project_name)}
            helperText={errors.project_name}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="project_type-label">Project Type</InputLabel>
            <Select
              id="project_type"
              name="project_type"
              labelId="project_type-label"
              label="Project Type"
              value={values.project_type}
              labelWidth={300}
              onChange={handleChange}
              error={touched.project_type && Boolean(errors.project_type)}
              displayEmpty
              inputProps={{ 'aria-label': 'Project Type' }}>
              {props.project_type.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.project_type}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'project_activities'}
            label={'Project Activities'}
            options={props.activity}
            required={false}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'climate_change_initiatives'}
            label={'Climate Change Initiatives'}
            options={props.climate_change_initiative}
            required={false}
          />
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item>
            <TextField
              id="start_date"
              name="start_date"
              label="Start Date"
              variant="outlined"
              required={true}
              value={values.start_date}
              type="date"
              inputProps={{ min: '1900-01-01', max: '2100-12-31' }}
              onChange={handleChange}
              error={touched.start_date && Boolean(errors.start_date)}
              helperText={errors.start_date}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              id="end_date"
              name="end_date"
              label="End Date"
              variant="outlined"
              value={values.end_date}
              type="date"
              inputProps={{ min: '1900-01-01', max: '2100-12-31' }}
              onChange={handleChange}
              error={touched.end_date && Boolean(errors.end_date)}
              helperText={errors.end_date}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectDetailsForm;
