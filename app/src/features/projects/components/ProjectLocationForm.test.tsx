import MapBoundary from 'components/boundary/MapBoundary';
import { Formik } from 'formik';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import ProjectLocationForm, {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from './ProjectLocationForm';

// Mock MapBoundary component
jest.mock('../../../components/boundary/MapBoundary');
const mockMapBoundary = MapBoundary as jest.Mock;

describe('ProjectLocationForm', () => {
  beforeEach(() => {
    mockMapBoundary.mockImplementation(() => <div />);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default values', async () => {
    const { getByLabelText, getByTestId } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={jest.fn()}>
        {() => <ProjectLocationForm />}
      </Formik>
    );

    await waitFor(() => {
      // Assert MapBoundary was rendered with the right propsF
      expect(MapBoundary).toHaveBeenCalledWith(
        {
          name: 'location.geometry',
          title: 'Define Project Boundary',
          mapId: 'project_location_form_map',
          bounds: undefined,
          formikProps: expect.objectContaining({ values: ProjectLocationFormInitialValues })
        },
        expect.anything()
      );
      // Assert description field is visible and populated correctly
      expect(getByLabelText('Location Description', { exact: false })).toBeVisible();
      expect(getByTestId('location.location_description')).toHaveValue('');
    });
  });

  it('renders correctly with non default values', async () => {
    const existingFormValues: IProjectLocationForm = {
      location: {
        location_description: 'this is a location description',
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

    const { getByLabelText, getByTestId } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={jest.fn()}>
        {() => <ProjectLocationForm />}
      </Formik>
    );

    await waitFor(() => {
      // Assert MapBoundary was rendered with the right props
      expect(MapBoundary).toHaveBeenCalledWith(
        {
          name: 'location.geometry',
          title: 'Define Project Boundary',
          mapId: 'project_location_form_map',
          bounds: undefined,
          formikProps: expect.objectContaining({ values: existingFormValues })
        },
        expect.anything()
      );
      // Assert description field is visible and populated correctly
      expect(getByLabelText('Location Description', { exact: false })).toBeVisible();
      expect(getByTestId('location.location_description')).toHaveValue('this is a location description');
    });
  });
});
