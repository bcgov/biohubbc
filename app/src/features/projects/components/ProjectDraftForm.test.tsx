import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormInitialValues,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import { Formik } from 'formik';
import { render, waitFor } from 'test-helpers/test-utils';

const handleSaveAndNext = jest.fn();

describe('Project Draft Form', () => {
  it('renders correctly with empty initial values', async () => {
    const { getByLabelText } = render(
      <Formik
        initialValues={ProjectDraftFormInitialValues}
        validationSchema={ProjectDraftFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectDraftForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Draft Name', { exact: false })).toBeVisible();
    });
  });

  it('renders correctly with populated initial values', async () => {
    const projectDraftFilledValues: IProjectDraftForm = {
      draft_name: 'draft test name'
    };

    const { getByLabelText, getByDisplayValue } = render(
      <Formik
        initialValues={projectDraftFilledValues}
        validationSchema={ProjectDraftFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDraftForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Draft Name', { exact: false })).toBeVisible();
      expect(getByDisplayValue('draft test name', { exact: false })).toBeVisible();
    });
  });

  it('renders correctly with errors', async () => {
    const projectDraftFilledValues: IProjectDraftForm = {
      draft_name: 'draft test name'
    };

    const { getByLabelText, getByText } = render(
      <Formik
        initialValues={projectDraftFilledValues}
        initialErrors={{
          draft_name: 'Error this is a required field'
        }}
        initialTouched={{
          draft_name: true
        }}
        validationSchema={ProjectDraftFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectDraftForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByLabelText('Draft Name', { exact: false })).toBeVisible();
      expect(getByText('Error this is a required field', { exact: false })).toBeVisible();
    });
  });
});
