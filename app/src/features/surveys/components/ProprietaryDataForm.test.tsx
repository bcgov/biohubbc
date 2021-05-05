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
  survey_data_proprietary: 'true',
  data_sharing_agreement_required: 'true'
};

describe('Proprietary Data Form', () => {
  it('renders correctly the empty component correctly when survey data is not proprietary', () => {
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

  it('renders correctly the filled component correctly when survey data is proprietary', () => {
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

  it('renders correctly when errors exist when survey data is proprietary', () => {
    const { asFragment } = render(
      <Formik
        initialValues={proprietaryDataFilledValues}
        validationSchema={ProprietaryDataYupSchema}
        validateOnBlur={true}
        initialErrors={{
          survey_data_proprietary: 'error on survey data proprietary field',
          proprietary_data_category: 'error on proprietary data category field',
          proprietor_name: 'error on proprietor name field',
          category_rational: 'error on category rational field',
          data_sharing_agreement_required: 'error on data sharing agreement required field'
        }}
        initialTouched={{
          survey_data_proprietary: true,
          proprietary_data_category: true,
          proprietor_name: true,
          category_rational: true,
          data_sharing_agreement_required: true
        }}
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
