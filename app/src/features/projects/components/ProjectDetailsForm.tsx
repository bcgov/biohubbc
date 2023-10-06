import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
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
    project_programs: number[];
    start_date: string;
    end_date: string;
  };
}

export const ProjectDetailsFormInitialValues: IProjectDetailsForm = {
  project: {
    project_name: '',
    project_programs: [],
    start_date: '',
    end_date: ''
  }
};

export const ProjectDetailsFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Project Name is Required'),
    project_programs: yup
      .array(yup.number())
      .min(1, 'At least 1 Project Program is Required')
      .required('Project Program is Required'),
    start_date: yup.string().isValidDateString().required('Start Date is Required'),
    end_date: yup.string().nullable().isValidDateString().isEndDateSameOrAfterStartDate('start_date')
  })
});

export interface IProjectDetailsFormProps {
  program: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectDetailsForm: React.FC<IProjectDetailsFormProps> = (props) => {
  const formikProps = useFormikContext<ICreateProjectRequest>();

  const { touched, errors, handleSubmit } = formikProps;

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
            error={touched.project?.project_programs && Boolean(errors.project?.project_programs)}>
            <MultiAutocompleteFieldVariableSize
              id={'project.project_programs'}
              label={'Project Programs'}
              options={props.program}
              required
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
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
