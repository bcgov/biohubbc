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
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectDetailsForm {
  project: {
    project_name: string;
    project_type: number;
    project_activities: number[];
    start_date: string;
    end_date: string;
  };
}

export const ProjectDetailsFormInitialValues: IProjectDetailsForm = {
  project: {
    project_name: '',
    project_type: '' as unknown as number,
    project_activities: [],
    start_date: '',
    end_date: ''
  }
};

export const ProjectDetailsFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Project Name is Required'),
    project_type: yup.number().required('Project Type is Required'),
    start_date: yup.string().isValidDateString().required('Start Date is Required'),
    end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date')
  })
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
  const formikProps = useFormikContext<ICreateProjectRequest>();

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="project.project_name"
            label="Project Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl
            fullWidth
            variant="outlined"
            required={true}
            error={touched.project?.project_type && Boolean(errors.project?.project_type)}>
            <InputLabel id="project_type-label">Project Type</InputLabel>
            <Select
              id="project_type"
              name="project.project_type"
              labelId="project_type-label"
              label="Project Type"
              value={values.project.project_type || ''}
              labelWidth={300}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Project Type' }}>
              {props.project_type.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            {errors.project?.project_type && (
              <FormHelperText>{touched.project?.project_type && errors.project?.project_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'project.project_activities'}
            label={'Project Activities'}
            options={props.activity}
            required={false}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StartEndDateFields
            formikProps={formikProps}
            startName="project.start_date"
            endName="project.end_date"
            startRequired={true}
            endRequired={false}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectDetailsForm;
