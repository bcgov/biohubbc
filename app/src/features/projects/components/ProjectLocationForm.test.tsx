import { getByTestId, render, fireEvent, waitFor, getByText, queryByText } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectLocationForm, {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from './ProjectLocationForm';
import { kml } from '@tmcw/togeojson';

jest.mock('@tmcw/togeojson', () => ({
  kml: jest.fn()
}));

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

  it('renders correctly with errors on fields', () => {
    const existingFormValues: IProjectLocationForm = {
      regions: ['region 1', 'region 2'],
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
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{ location_description: 'error is here' }}
        initialTouched={{ location_description: true }}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm region={region} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('displays an error when the spatial upload is attempted with an incorrect file type', async () => {
    const file = new File([''], 'testfile.json', {
      lastModified: 1614369038812,
      type: 'application/json'
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
      return Promise.resolve('some test file contents');
    });

    //@ts-ignore
    const inputField = getByTestId(container, 'file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    //@ts-ignore
    expect(getByText(container, 'You must upload a KML file, please try again.')).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getByText(container, 'Upload KML'));

    //@ts-ignore
    expect(queryByText(container, 'You must upload a KML file, please try again.')).toBeNull();
  });

  it('displays the uploaded geo on the map when the spatial upload succeeds', async () => {
    kml.mockReturnValueOnce({
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ]
            ]
          },
          properties: {
            name: 'Biohub island'
          }
        }
      ]
    });

    File.prototype.text = jest.fn().mockImplementation(() => {
      return Promise.resolve('<kml>some test file contents</kml>');
    });

    DOMParser.prototype.parseFromString = jest.fn().mockImplementation(() => {
      return new Document();
    });

    const file = new File([''], 'testfile.kml', {
      lastModified: 1614369038812,
      type: 'application/vnd.google-earth.kml+xml'
    });

    const { container, asFragment } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm region={region} />}
      </Formik>
    );

    //@ts-ignore
    const inputField = getByTestId(container, 'file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    //@ts-ignore
    expect(queryByText(container, 'You must upload a KML file, please try again.')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });
});
