import { render, waitFor } from 'test-helpers/test-utils';
import { Formik } from 'formik';
import React from 'react';
import ProjectLocationForm, {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from './ProjectLocationForm';

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('ProjectLocationForm', () => {
  it('renders correctly with default empty values', async () => {
    const { getByLabelText, getByText } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByText('Define Project Boundary', { exact: false })).toBeVisible();
      expect(getByLabelText('Location Description', { exact: false })).toBeVisible();
    });
  });

  it('renders correctly with existing location values', async () => {
    const existingFormValues: IProjectLocationForm = {
      location: {
        location_description: 'a location description',
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

    const { getByLabelText, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByText('Define Project Boundary', { exact: false })).toBeVisible();
      expect(getByLabelText('Location Description', { exact: false })).toBeVisible();
      expect(getByText('a location description')).toBeVisible();
    });
  });
});
