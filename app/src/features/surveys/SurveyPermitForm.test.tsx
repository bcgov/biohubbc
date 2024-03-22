import { Formik } from 'formik';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import SurveyPermitForm, { ISurveyPermitForm, SurveyPermitFormYupSchema } from './SurveyPermitForm';

describe('SurveyPermitForm', () => {
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
