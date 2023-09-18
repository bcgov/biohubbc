import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import SurveyAnimals from './SurveyAnimals';

jest.mock('../../../hooks/useBioHubApi');
jest.mock('../../../hooks/useTelemetryApi');
const mockBiohubApi = useBiohubApi as jest.Mock;
const mockTelemetryApi = useTelemetryApi as jest.Mock;

const mockUseBiohub = {
  survey: {
    getSurveyCritters: jest.fn(),
    getDeploymentsInSurvey: jest.fn(),
    createCritterAndAddToSurvey: jest.fn(),
    addDeployment: jest.fn()
  }
};

const mockUseTelemetry = {
  devices: {
    getDeviceDetails: jest.fn()
  }
};

describe('SurveyAnimals', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseBiohub);
    mockUseBiohub.survey.getDeploymentsInSurvey.mockClear();
    mockUseBiohub.survey.getSurveyCritters.mockClear();
    mockUseBiohub.survey.createCritterAndAddToSurvey.mockClear();
    mockUseBiohub.survey.addDeployment.mockClear();

    mockTelemetryApi.mockImplementation(() => mockUseTelemetry);
    mockUseTelemetry.devices.getDeviceDetails.mockClear();
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
    mockUseBiohub.survey.getSurveyCritters.mockResolvedValueOnce([{ critter_id: 'abc', survey_critter_id: 1 }]);

    const { getByText } = render(<SurveyAnimals />);

    await waitFor(() => {
      expect(getByText('abc')).toBeInTheDocument();
    });
  });
});
