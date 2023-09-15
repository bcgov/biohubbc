import { useBiohubApi } from 'hooks/useBioHubApi';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import SurveyAnimals from './SurveyAnimals';

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  survey: {
    getSurveyCritters: jest.fn(),
    getDeploymentsInSurvey: jest.fn(),
    createCritterAndAddToSurvey: jest.fn(),
    addDeployment: jest.fn()
  }
};

describe('SurveyAnimals', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.survey.getDeploymentsInSurvey.mockClear();
    mockUseApi.survey.getSurveyCritters.mockClear();
    mockUseApi.survey.createCritterAndAddToSurvey.mockClear();
    mockUseApi.survey.addDeployment.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no animals', async () => {
    const { getByText } = render(<SurveyAnimals />);

    await waitFor(() => {
      expect(getByText('No Individual Animals')).toBeInTheDocument();
    });
  });

  it('renders correctly with animals', async () => {
    mockUseApi.survey.getSurveyCritters.mockResolvedValueOnce([{ critter_id: 'abc', survey_critter_id: 1 }]);

    const { getByText } = render(<SurveyAnimals />);

    await waitFor(() => {
      expect(getByText('abc')).toBeInTheDocument();
    });
  });
});
