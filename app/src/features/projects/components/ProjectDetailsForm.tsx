import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectDetailsForm {
  project_name: string;
  project_type: number;
  project_activities: number[];
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
}

export const ProjectDetailsFormInitialValues: IProjectDetailsForm = {
  project_name: '',
  project_type: ('' as unknown) as number,
  project_activities: [],
  climate_change_initiatives: [],
  start_date: '',
  end_date: ''
};

export const ProjectDetailsFormYupSchema = yup.object().shape({
  project_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  project_type: yup.number().required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date')
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
        <StartEndDateFields formikProps={formikProps} startRequired={true} endRequired={false} />
      </Grid>
    </form>
  );
};

export default ProjectDetailsForm;
