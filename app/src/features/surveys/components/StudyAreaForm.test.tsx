import { cleanup } from '@testing-library/react-hooks';
import MapBoundary from 'components/boundary/MapBoundary';
import StudyAreaForm, {
  ISurveyLocationForm,
  SurveyLocationInitialValues,
  SurveyLocationYupSchema
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
        initialValues={SurveyLocationInitialValues}
        validationSchema={SurveyLocationYupSchema}
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
          name: 'locations[0].geojson',
          title: 'Study Area Boundary',
          mapId: 'study_area_form_map',
          bounds: undefined,
          formikProps: expect.objectContaining({ values: SurveyLocationInitialValues })
        },
        expect.anything()
      );
      // Assert survey area name field is visible and populated correctly
      expect(getByLabelText('Survey Area Name', { exact: false })).toBeVisible();
      expect(getByTestId('locations[0].name')).toHaveValue('');
    });
  });

  it('renders correctly with non default values', async () => {
    const existingFormValues: ISurveyLocationForm = {
      locations: [
        {
          name: 'a study area name',
          description: 'a study area description',
          geojson: [
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
      ]
    };

    const { getByLabelText, getByTestId } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyLocationYupSchema}
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
          name: 'locations[0].geojson',
          title: 'Study Area Boundary',
          mapId: 'study_area_form_map',
          bounds: undefined,
          formikProps: expect.objectContaining({ values: existingFormValues })
        },
        expect.anything()
      );
      // Assert survey area name field is visible and populated correctly
      expect(getByLabelText('Survey Area Name', { exact: false })).toBeVisible();
      expect(getByTestId('locations[0].name')).toHaveValue('a study area name');
    });
  });
});
