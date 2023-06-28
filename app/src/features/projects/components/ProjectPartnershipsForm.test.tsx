import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import ProjectPartnershipsForm, {
  IProjectPartnershipsForm,
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from './ProjectPartnershipsForm';

const first_nations: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'nation 1'
  },
  {
    value: 2,
    label: 'nation 2'
  }
];

const stakeholder_partnerships: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'partner 1'
  },
  {
    value: 2,
    label: 'partner 2'
  }
];

describe('ProjectPartnershipsForm', () => {
  it('renders correctly with default empty values', () => {
    const { getByLabelText } = render(
      <Formik
        initialValues={ProjectPartnershipsFormInitialValues}
        validationSchema={ProjectPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectPartnershipsForm first_nations={first_nations} stakeholder_partnerships={stakeholder_partnerships} />
        )}
      </Formik>
    );

    expect(getByLabelText('Indigenous Partnerships', { exact: false })).toBeVisible();
    expect(getByLabelText('Other Partnerships', { exact: false })).toBeVisible();
  });

  it('renders correctly with existing funding values', () => {
    const existingFormValues: IProjectPartnershipsForm = {
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: [1 as unknown as string]
      }
    };

    const { getByLabelText, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectPartnershipsForm first_nations={first_nations} stakeholder_partnerships={stakeholder_partnerships} />
        )}
      </Formik>
    );

    expect(getByLabelText('Indigenous Partnerships', { exact: false })).toBeVisible();
    expect(getByLabelText('Other Partnerships', { exact: false })).toBeVisible();
    expect(getByText('nation 1')).toBeVisible();
    expect(getByText('nation 2')).toBeVisible();
    expect(getByText('partner 1', { exact: false })).toBeVisible();
  });
});
