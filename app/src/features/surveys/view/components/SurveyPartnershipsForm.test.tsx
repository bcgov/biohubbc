import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import SurveyPartnershipsForm, {
  ISurveyPartnershipsForm,
  SurveyPartnershipsFormInitialValues,
  SurveyPartnershipsFormYupSchema
} from './SurveyPartnershipsForm';

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
    /*
    // TODO 

  const codesContext = useContext(CodesContext);

  const codes = codesContext.codesDataLoader.data;
  codesContext.codesDataLoader.load();

  const { handleSubmit } = formikProps;

  const first_nations: IMultiAutocompleteFieldOption[] =
    codes?.first_nations?.map((item) => {
      return { value: item.id, label: item.name };
    }) || [];

  const stakeholder_partnerships: IMultiAutocompleteFieldOption[] =
    codes?.agency?.map((item) => {
      return { value: item.name, label: item.name };
    }) || [];
    */

    const { getByLabelText } = render(
      <Formik
        initialValues={SurveyPartnershipsFormInitialValues}
        validationSchema={SurveyPartnershipsFormInitialValues}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPartnershipsForm />}
      </Formik>
    );

    expect(getByLabelText('Indigenous Partnerships', { exact: false })).toBeVisible();
    expect(getByLabelText('Other Partnerships', { exact: false })).toBeVisible();
  });

  it('renders correctly with existing funding values', () => {
    const existingFormValues: ISurveyPartnershipsForm = {
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: [1 as unknown as string]
      }
    };

    const { getByLabelText, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPartnershipsForm />}
      </Formik>
    );

    expect(getByLabelText('Indigenous Partnerships', { exact: false })).toBeVisible();
    expect(getByLabelText('Other Partnerships', { exact: false })).toBeVisible();
    expect(getByText('nation 1')).toBeVisible();
    expect(getByText('nation 2')).toBeVisible();
    expect(getByText('partner 1', { exact: false })).toBeVisible();
  });
});
