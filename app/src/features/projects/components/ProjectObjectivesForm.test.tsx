import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import ProjectObjectivesForm, {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from './ProjectObjectivesForm';

describe('ProjectObjectivesForm', () => {
  it('renders correctly with default empty values', () => {
    const { getAllByLabelText } = render(
      <Formik
        initialValues={ProjectObjectivesFormInitialValues}
        validationSchema={ProjectObjectivesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectObjectivesForm />}
      </Formik>
    );

    expect(getAllByLabelText('Objectives', { exact: false })).toBeVisible();
  });

  it('renders correctly with existing objective/caveat values', () => {
    const existingFormValues: IProjectObjectivesForm = {
      objectives: {
        objectives: 'a project objective'
      }
    };

    const { getAllByLabelText, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectObjectivesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectObjectivesForm />}
      </Formik>
    );

    expect(getAllByLabelText('Objectives', { exact: false })).toBeVisible();
    expect(getByText('a project objective')).toBeVisible();
  });
});
