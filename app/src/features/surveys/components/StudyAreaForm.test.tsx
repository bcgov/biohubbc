import { cleanup } from '@testing-library/react-hooks';
import MapBoundary from 'components/boundary/MapBoundary';
import StudyAreaForm, {
  IStudyAreaForm,
  StudyAreaInitialValues,
  StudyAreaYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { Formik } from 'formik';
import { render, waitFor } from 'test-helpers/test-utils';

// Mock MapBoundary component
jest.mock('../../../components/boundary/MapBoundary');
const mockMapBoundary = MapBoundary as jest.Mock;

describe('Study Area Form', () => {
  beforeEach(() => {
    mockMapBoundary.mockImplementation(() => <div />);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default values', async () => {
    const { getByLabelText, getByTestId } = render(
      <Formik
        initialValues={StudyAreaInitialValues}
        validationSchema={StudyAreaYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={jest.fn()}>
        {() => <StudyAreaForm />}
      </Formik>
    );

    await waitFor(() => {
      // Assert MapBoundary was rendered with the right propsF
      expect(MapBoundary).toHaveBeenCalledWith(
        {
          name: 'location.geometry',
          title: 'Study Area Boundary',
          mapId: 'study_area_form_map',
          bounds: undefined,
          formikProps: expect.objectContaining({ values: StudyAreaInitialValues })
        },
        expect.anything()
      );
      // Assert survey area name field is visible and populated correctly
      expect(getByLabelText('Survey Area Name', { exact: false })).toBeVisible();
      expect(getByTestId('location.survey_area_name')).toHaveValue('');
    });
  });

  it('renders correctly with non default values', async () => {
    const existingFormValues: IStudyAreaForm = {
      location: {
        survey_area_name: 'a study area name',
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
        validationSchema={StudyAreaYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={jest.fn()}>
        {() => <StudyAreaForm />}
      </Formik>
    );

    await waitFor(() => {
      // Assert MapBoundary was rendered with the right propsF
      expect(MapBoundary).toHaveBeenCalledWith(
        {
          name: 'location.geometry',
          title: 'Study Area Boundary',
          mapId: 'study_area_form_map',
          bounds: undefined,
          formikProps: expect.objectContaining({ values: existingFormValues })
        },
        expect.anything()
      );
      // Assert survey area name field is visible and populated correctly
      expect(getByLabelText('Survey Area Name', { exact: false })).toBeVisible();
      expect(getByTestId('location.survey_area_name')).toHaveValue('a study area name');
    });
  });
});
