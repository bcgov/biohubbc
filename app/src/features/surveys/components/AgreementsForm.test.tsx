import AgreementsForm, {
  AgreementsInitialValues,
  AgreementsYupSchema,
  IAgreementsForm
} from 'features/surveys/components/AgreementsForm';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';

const handleSaveAndNext = jest.fn();

const agreementsFilledValues: IAgreementsForm = {
  agreements: {
    sedis_procedures_accepted: 'true',
    foippa_requirements_accepted: 'true'
  }
};

describe('Agreements Form', () => {
  it.skip('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={AgreementsInitialValues}
        validationSchema={AgreementsYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <AgreementsForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={agreementsFilledValues}
        validationSchema={AgreementsYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <AgreementsForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly when errors exist', () => {
    const { asFragment } = render(
      <Formik
        initialValues={agreementsFilledValues}
        validationSchema={AgreementsYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{
          agreements: {
            sedis_procedures_accepted: 'error on sedis field',
            foippa_requirements_accepted: 'error on foippa field'
          }
        }}
        initialTouched={{
          agreements: {
            sedis_procedures_accepted: true,
            foippa_requirements_accepted: true
          }
        }}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <AgreementsForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
