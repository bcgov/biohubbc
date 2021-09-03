import { getByTestId, render, fireEvent, waitFor, getByText, queryByText } from '@testing-library/react';
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

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('ProjectLocationForm', () => {
  it('renders correctly with default empty values', async () => {
    const { asFragment } = render(
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
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with existing location values', async () => {
    const existingFormValues: IProjectLocationForm = {
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
        {() => <ProjectLocationForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with errors on fields', async () => {
    const existingFormValues: IProjectLocationForm = {
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
        {() => <ProjectLocationForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('displays an error when the spatial kml upload is attempted with an incorrect file type', async () => {
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
        {() => <ProjectLocationForm />}
      </Formik>
    );

    File.prototype.text = jest.fn().mockImplementation(() => {
      return Promise.resolve('some test file contents');
    });

    //@ts-ignore
    const inputField = getByTestId(container, 'kml-file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    //@ts-ignore
    expect(getByText(container, 'You must upload a KML file, please try again.')).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getByText(container, 'Upload KML'));

    //@ts-ignore
    expect(queryByText(container, 'You must upload a KML file, please try again.')).toBeNull();
  });

  it('displays an error when the spatial gpx upload is attempted with an incorrect file type', async () => {
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
        {() => <ProjectLocationForm />}
      </Formik>
    );

    File.prototype.text = jest.fn().mockImplementation(() => {
      return Promise.resolve('some test file contents');
    });

    //@ts-ignore
    const inputField = getByTestId(container, 'gpx-file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    //@ts-ignore
    expect(getByText(container, 'You must upload a GPX file, please try again.')).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getByText(container, 'Upload GPX'));

    //@ts-ignore
    expect(queryByText(container, 'You must upload a GPX file, please try again.')).toBeNull();
  });

  it('displays the uploaded geo on the map when the spatial kml upload succeeds', async () => {
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
        {() => <ProjectLocationForm />}
      </Formik>
    );

    //@ts-ignore
    const inputField = getByTestId(container, 'kml-file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    //@ts-ignore
    expect(queryByText(container, 'You must upload a KML file, please try again.')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the uploaded geo on the map when the spatial gpx upload succeeds', async () => {
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
      return Promise.resolve('<gpx>some test file contents</gpx>');
    });

    DOMParser.prototype.parseFromString = jest.fn().mockImplementation(() => {
      return new Document();
    });

    const file = new File([''], 'testfile.gpx', {
      lastModified: 1614369038812,
      type: 'application.gpx'
    });

    const { container, asFragment } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectLocationForm />}
      </Formik>
    );

    //@ts-ignore
    const inputField = getByTestId(container, 'gpx-file-upload');

    fireEvent.change(inputField, { target: { files: [file] } });

    await waitFor(() => {});

    //@ts-ignore
    expect(queryByText(container, 'You must upload a GPX file, please try again.')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });
});
