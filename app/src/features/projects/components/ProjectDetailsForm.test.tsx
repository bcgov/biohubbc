import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import { render, waitFor } from 'test-helpers/test-utils';
import ProjectDetailsForm, {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from './ProjectDetailsForm';

const project_programs: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'type 1'
  },
  {
    value: 2,
    label: 'type 2'
  },
  {
    value: 3,
    label: 'type 3'
  }
];

describe('ProjectDetailsForm', () => {
  it('renders correctly with default empty values', async () => {
    const { getByLabelText } = render(
      <Formik
        initialValues={ProjectDetailsFormInitialValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDetailsForm program={project_programs} />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Project Name', { exact: false })).toBeVisible();
    });
  });

  it('renders correctly with existing details values', async () => {
    const existingFormValues: IProjectDetailsForm = {
      project: {
        project_name: 'name 1',
        project_programs: [2],
        start_date: '2021-03-14',
        end_date: '2021-04-14'
      }
    };

    const { getByLabelText, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDetailsForm program={project_programs} />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Project Name', { exact: false })).toBeVisible();
      expect(getByText('type 2', { exact: false })).toBeVisible();
    });
  });
});
