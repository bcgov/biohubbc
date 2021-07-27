import { render } from '@testing-library/react';
import { Formik } from 'formik';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from 'features/surveys/components/StudyAreaForm';
import React from 'react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';

const handleSaveAndNext = jest.fn();

const studyAreaFilledValues = {
  survey_area_name: 'Study area name',
  geometry: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [125.6, 10.1]
      },
      properties: {
        name: 'Dinagat Islands'
      }
    }
  ]
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
        {() => <StudyAreaForm />}
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
        {() => <StudyAreaForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when errors exist', () => {
    const { asFragment } = render(
      <Formik
        initialValues={studyAreaFilledValues}
        validationSchema={StudyAreaYupSchema}
        initialErrors={{
          survey_area_name: 'error on survey area name field'
        }}
        initialTouched={{
          survey_area_name: true
        }}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <StudyAreaForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
