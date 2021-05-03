import { render } from '@testing-library/react';
import { Formik } from 'formik';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from 'features/surveys/components/StudyAreaForm';
import React from 'react';

const handleSaveAndNext = jest.fn();

const park = ['Park 1', 'Park 2'];
const management_unit = ['Management Unit 1', 'Management Unit 2'];

const studyAreaFilledValues = {
  survey_area_name: 'Study area name',
  park: 'Park 1',
  management_unit: 'Management Unit 2'
};

describe('Study Area Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={StudyAreaInitialValues}
        validationSchema={StudyAreaYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <StudyAreaForm park={park} management_unit={management_unit} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={studyAreaFilledValues}
        validationSchema={StudyAreaYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <StudyAreaForm park={park} management_unit={management_unit} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
