import { render } from '@testing-library/react';
import { Formik } from 'formik';
import ProprietaryDataForm, {
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema
} from 'features/surveys/components/ProprietaryDataForm';
import React from 'react';

const handleSaveAndNext = jest.fn();

const proprietary_data_category = ['Category 1', 'Category 2'];

const proprietaryDataFilledValues = {
  proprietary_data_category: 'Category 1',
  proprietor_name: 'name',
  category_rational: 'rational is cause it is true',
  survey_data_proprietary: 'false',
  data_sharing_agreement_required: 'true'
};

describe('Proprietary Data Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProprietaryDataInitialValues}
        validationSchema={ProprietaryDataYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProprietaryDataForm proprietary_data_category={proprietary_data_category} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={proprietaryDataFilledValues}
        validationSchema={ProprietaryDataYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProprietaryDataForm proprietary_data_category={proprietary_data_category} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
