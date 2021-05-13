import { render } from '@testing-library/react';
import { Formik } from 'formik';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from 'features/surveys/components/StudyAreaForm';
import React from 'react';

const handleSaveAndNext = jest.fn();

const studyAreaFilledValues = {
  survey_area_name: 'Study area name',
  park: 'Park name 1',
  management_unit: 'Management unit 2',
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
        {() => (
          <StudyAreaForm
            park={[
              { value: 'Park name 1', label: 'Park name 1' },
              { value: 'Park name 2', label: 'Park name 2' }
            ]}
            management_unit={[
              { value: 'Management unit 1', label: 'Management unit 1' },
              { value: 'Management unit 2', label: 'Management unit 2' }
            ]}
          />
        )}
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
        {() => (
          <StudyAreaForm
            park={[
              { value: 'Park name 1', label: 'Park name 1' },
              { value: 'Park name 2', label: 'Park name 2' }
            ]}
            management_unit={[
              { value: 'Management unit 1', label: 'Management unit 1' },
              { value: 'Management unit 2', label: 'Management unit 2' }
            ]}
          />
        )}
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
          survey_area_name: 'error on survey area name field',
          park: 'error on park field',
          management_unit: 'error on management unit field'
        }}
        initialTouched={{
          survey_area_name: true,
          park: true,
          management_unit: true
        }}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <StudyAreaForm
            park={[
              { value: 'Park name 1', label: 'Park name 1' },
              { value: 'Park name 2', label: 'Park name 2' }
            ]}
            management_unit={[
              { value: 'Management unit 1', label: 'Management unit 1' },
              { value: 'Management unit 2', label: 'Management unit 2' }
            ]}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
