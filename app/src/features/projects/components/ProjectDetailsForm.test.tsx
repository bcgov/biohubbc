import { Formik } from 'formik';
import { render, waitFor } from 'test-helpers/test-utils';
import ProjectDetailsForm, {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from './ProjectDetailsForm';

describe('ProjectDetailsForm', () => {
  it('renders correctly with default empty values', async () => {
    const { getByLabelText } = render(
      <Formik
        initialValues={ProjectDetailsFormInitialValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDetailsForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Project Name', { exact: false })).toBeVisible();
    });
  });

  it('renders correctly with existing details values', async () => {
    const existingFormValues: IProjectDetailsForm = {
      project: {
        project_name: 'name 1'
      }
    };

    const { getByLabelText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDetailsForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Project Name', { exact: false })).toBeVisible();
    });
  });
});
