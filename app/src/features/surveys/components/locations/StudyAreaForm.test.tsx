import StudyAreaForm, {
  ISurveyLocationForm,
  SurveyLocationInitialValues,
  SurveyLocationYupSchema
} from 'features/surveys/components/locations/StudyAreaForm';
import { Formik } from 'formik';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { SurveyAreaMapControl } from './SurveyAreaMapControl';

// Mock Map Controller component
vi.mock('./SurveyAreaMapControl');
const mockMap = SurveyAreaMapControl as Mock;

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
        onSubmit={vi.fn()}>
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
          ],
          uuid: '1234-5678-9101-1121'
        }
      ]
    };

    const { getByTestId, findByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyLocationYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={vi.fn()}>
        {() => <StudyAreaForm />}
      </Formik>
    );

    await waitFor(async () => {
      expect(getByTestId('study-area-list')).toBeVisible();
      expect(await findByText('a study area description')).toBeVisible();
    });
  });
});
