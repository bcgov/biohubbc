import { render, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { Formik } from 'formik';
import React from 'react';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
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

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByLabelText, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Formik
          initialValues={existingFormValues}
          validationSchema={ProjectLocationFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          {() => <ProjectLocationForm />}
        </Formik>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Define Project Boundary', { exact: false })).toBeVisible();
      expect(getByLabelText('Location Description', { exact: false })).toBeVisible();
      expect(getByText('a location description')).toBeVisible();
    });
  });
});
