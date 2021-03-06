import { getByTestId, render, fireEvent, waitFor } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectLocationForm, {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from './ProjectLocationForm';

const region: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'region 1'
  },
  {
    value: 2,
    label: 'region 2'
  }
];

describe('ProjectLocationForm', () => {
  const setGeometry = jest.fn();

  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm region={region} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing location values', () => {
    const existingFormValues: IProjectLocationForm = {
      regions: ['region 1', 'region 2'],
      location_description: 'a location description'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm region={region} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.only('handles the spatial upload correctly', async () => {
    const file = new File([''], 'testfile.kml', {
      lastModified: 1614369038812,
      type: ''
    });

    const { container } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm region={region} />}
      </Formik>
    );

    File.prototype.text = jest.fn().mockImplementation(() => {
      return Promise.resolve('<xml>some test file contents</xml>');
    });

    //@ts-ignore
    const inputField = getByTestId(container, 'file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    expect(setGeometry).toHaveBeenCalled();
  });
});
