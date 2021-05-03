import { render } from '@testing-library/react';
import { Formik } from 'formik';
import AgreementsForm, {
  AgreementsInitialValues,
  AgreementsYupSchema
} from 'features/surveys/components/AgreementsForm';
import React from 'react';

const handleSaveAndNext = jest.fn();

const agreementsFilledValues = {
  sedis_procedures_accepted: true,
  foippa_requirements_accepted: true
};

describe('Agreements Form', () => {
  it('renders correctly the empty component correctly', () => {
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

  it('renders correctly the filled component correctly', () => {
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
});
