import { render } from '@testing-library/react';
import { Formik } from 'formik';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from 'features/surveys/components/GeneralInformationForm';
import React from 'react';

const handleSaveAndNext = jest.fn();

const species: string[] = ['species 1', 'species 2'];

const generalInformationFilledValues = {
  survey_name: 'survey name',
  start_date: '2021-04-09 11:53:53',
  end_date: '2021-05-10 11:53:53',
  species: 'species 1',
  survey_purpose: 'purpose',
  biologist_first_name: 'first',
  biologist_last_name: 'last'
};

describe('General Information Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={GeneralInformationInitialValues}
        validationSchema={GeneralInformationYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <GeneralInformationForm species={species} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={generalInformationFilledValues}
        validationSchema={GeneralInformationYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <GeneralInformationForm species={species} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
