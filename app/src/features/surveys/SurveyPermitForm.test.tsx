import { Formik } from 'formik';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import SurveyPermitForm, {
  ISurveyPermitForm,
  SurveyPermitFormInitialValues,
  SurveyPermitFormYupSchema
} from './SurveyPermitForm';

describe('SurveyPermitForm', () => {
  it.skip('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={SurveyPermitFormInitialValues}
        validationSchema={SurveyPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with existing permit values', () => {
    const existingFormValues: ISurveyPermitForm = {
      permit: {
        permits: [
          {
            permit_id: 1,
            permit_number: '123',
            permit_type: 'Park Use Permit'
          },
          {
            permit_id: 2,
            permit_number: '3213123123',
            permit_type: 'Scientific Fish Collection Permit'
          }
        ]
      }
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with errors on the permit_number and permit_type fields', () => {
    const existingFormValues: ISurveyPermitForm = {
      permit: {
        permits: [
          {
            permit_id: 1,
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          },
          {
            permit_id: 2,
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          }
        ]
      }
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{
          permits: [{ permit_number: 'Error here', permit_type: 'Error here as well' }]
        }}
        initialTouched={{
          permits: [{ permit_number: true, permit_type: true }]
        }}
        onSubmit={async () => {}}>
        {() => <SurveyPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with error on the permits field due to duplicates', () => {
    const existingFormValues: ISurveyPermitForm = {
      permit: {
        permits: [
          {
            permit_id: 1,
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          },
          {
            permit_id: 2,
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          }
        ]
      }
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{ permits: 'Error is here' }}
        onSubmit={async () => {}}>
        {() => <SurveyPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('deletes existing permits when delete icon is clicked', async () => {
    const existingFormValues: ISurveyPermitForm = {
      permit: {
        permits: [
          {
            permit_id: 1,
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          }
        ]
      }
    };

    const { getByTestId, queryByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPermitForm />}
      </Formik>
    );

    expect(queryByText('Permit Number')).toBeInTheDocument();

    fireEvent.click(getByTestId('delete-icon'));

    await waitFor(() => {
      expect(queryByText('Permit Number')).toBeNull();
    });
  });
});
