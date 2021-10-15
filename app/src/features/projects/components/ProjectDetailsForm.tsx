import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import CustomTextField from 'components/fields/CustomTextField';
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
  start_date: string;
  end_date: string;
}

export const ProjectDetailsFormInitialValues: IProjectDetailsForm = {
  project_name: '',
  project_type: ('' as unknown) as number,
  project_activities: [],
  start_date: '',
  end_date: ''
};

export const ProjectDetailsFormYupSchema = yup.object().shape({
  project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  project_type: yup.number().required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date')
});

export interface IProjectDetailsFormProps {
  project_type: IMultiAutocompleteFieldOption[];
  activity: IMultiAutocompleteFieldOption[];
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
          <CustomTextField
            name="project_name"
            label="Project Name"
            other={{
              required: true
            }}
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
            <FormHelperText>{touched.project_type && errors.project_type}</FormHelperText>
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
        <StartEndDateFields formikProps={formikProps} startRequired={true} endRequired={false} />
      </Grid>
    </form>
  );
};

export default ProjectDetailsForm;
