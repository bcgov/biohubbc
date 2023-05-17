import { render, waitFor } from 'test-helpers/test-utils';
import StudyAreaForm, {
  IStudyAreaForm,
  StudyAreaInitialValues,
  StudyAreaYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { Formik } from 'formik';
import React from 'react';

const handleSaveAndNext = jest.fn();

const studyAreaFilledValues: IStudyAreaForm = {
  location: {
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
  }
};

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('Study Area Form', () => {
  it('renders correctly the empty component correctly', async () => {
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

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly the filled component correctly', async () => {
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

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly when errors exist', async () => {
    const { asFragment } = render(
      <Formik
        initialValues={studyAreaFilledValues}
        validationSchema={StudyAreaYupSchema}
        initialErrors={{
          location: {
            survey_area_name: 'error on survey area name field'
          }
        }}
        initialTouched={{
          location: {
            survey_area_name: true
          }
        }}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <StudyAreaForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
