import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import yup from 'utils/YupSchema';

export interface IProjectDetailsForm {
  project: {
    project_name: string;
  };
}

export const ProjectDetailsFormInitialValues: IProjectDetailsForm = {
  project: {
    project_name: ''
  }
};

export const ProjectDetailsFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Project Name is Required')
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectDetailsForm = () => {
  const formikProps = useFormikContext<ICreateProjectRequest>();

  const { handleSubmit } = formikProps;

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
      </Grid>
    </form>
  );
};

export default ProjectDetailsForm;
