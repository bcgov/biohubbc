import { cleanup } from '@testing-library/react-hooks';
import StudyAreaForm, {
  ISurveyLocationForm,
  SurveyLocationInitialValues,
  SurveyLocationYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { Formik } from 'formik';
import { render, waitFor } from 'test-helpers/test-utils';
import { SurveyAreaMapControl } from './locations/SurveyAreaMapControl';

// Mock Map Controller component
jest.mock('./locations/SurveyAreaMapControl');
const mockMap = SurveyAreaMapControl as jest.Mock;

describe('Study Area Form', () => {
  beforeEach(() => {
    mockMap.mockImplementation(() => <div />);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default values', async () => {
    const { getByTestId } = render(
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
      expect(getByTestId('study-area-list')).toBeVisible();
    });
  });

  it('renders correctly with non default values', async () => {
    const existingFormValues: ISurveyLocationForm = {
      locations: [
        {
          survey_location_id: 1,
          name: 'a study area name',
          description: 'a study area description',
          uuid: '1',
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

    const { getByTestId, findByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyLocationYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={jest.fn()}>
        {() => <StudyAreaForm />}
      </Formik>
    );

    await waitFor(async () => {
      expect(getByTestId('study-area-list')).toBeVisible();
      expect(await findByText('a study area description')).toBeVisible();
    });
  });
});
