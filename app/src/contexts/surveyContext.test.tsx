import { SurveyContext, SurveyContextProvider } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { useParams } from 'react-router';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';

vi.mock('hooks/useBioHubApi');
vi.mock('hooks/useDataLoader');
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn()
  };
});

const mockBiohubApi = useBiohubApi as Mock;
const mockUseDataLoader = useDataLoader as Mock;
const mockUseParams = useParams as Mock;

const createMockDataLoader = (refresh = vi.fn(), data?: unknown): DataLoader<[number, number], unknown, unknown> => ({
  data,
  error: undefined,
  isLoading: false,
  isReady: true,
  hasLoaded: false,
  load: vi.fn(),
  refresh,
  clearError: vi.fn(),
  clearData: vi.fn()
});

describe('SurveyContextProvider', () => {
  const surveyRefresh = vi.fn();
  const artifactRefresh = vi.fn();
  const critterRefresh = vi.fn();

  const mockApi = {
    survey: {
      getSurveyForView: vi.fn(),
      getSurveyAttachments: vi.fn(),
      getSurveyCritters: vi.fn()
    }
  };

  beforeEach(() => {
    mockBiohubApi.mockReturnValue(mockApi);
    mockUseParams.mockReturnValue({ id: '1', survey_id: '5' });

    mockUseDataLoader.mockImplementation((fetchFn) => {
      if (fetchFn === mockApi.survey.getSurveyForView) {
        return createMockDataLoader(surveyRefresh, undefined);
      }

      if (fetchFn === mockApi.survey.getSurveyAttachments) {
        return createMockDataLoader(artifactRefresh, undefined);
      }

      if (fetchFn === mockApi.survey.getSurveyCritters) {
        return createMockDataLoader(critterRefresh, undefined);
      }

      throw new Error('Unexpected data loader fetch function');
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('refreshes survey, artifact, and critter data loaders on mount', async () => {
    render(
      <SurveyContextProvider>
        <SurveyContext.Consumer>{() => <></>}</SurveyContext.Consumer>
      </SurveyContextProvider>
    );

    await waitFor(() => {
      expect(surveyRefresh).toHaveBeenCalledWith(1, 5);
      expect(artifactRefresh).toHaveBeenCalledWith(1, 5);
      expect(critterRefresh).toHaveBeenCalledWith(1, 5);
    });
  });

  it('does not refresh loaders when loaded survey data matches route params', async () => {
    mockUseDataLoader.mockImplementation((fetchFn) => {
      if (fetchFn === mockApi.survey.getSurveyForView) {
        return createMockDataLoader(surveyRefresh, {
          ...getSurveyForViewResponse,
          surveyData: {
            ...getSurveyForViewResponse.surveyData,
            survey_details: {
              ...getSurveyForViewResponse.surveyData.survey_details,
              project_id: 1,
              id: 5
            }
          }
        });
      }

      if (fetchFn === mockApi.survey.getSurveyAttachments) {
        return createMockDataLoader(artifactRefresh, undefined);
      }

      if (fetchFn === mockApi.survey.getSurveyCritters) {
        return createMockDataLoader(critterRefresh, undefined);
      }

      throw new Error('Unexpected data loader fetch function');
    });

    render(
      <SurveyContextProvider>
        <SurveyContext.Consumer>{() => <></>}</SurveyContext.Consumer>
      </SurveyContextProvider>
    );

    await waitFor(() => {
      expect(surveyRefresh).not.toHaveBeenCalled();
      expect(artifactRefresh).not.toHaveBeenCalled();
      expect(critterRefresh).not.toHaveBeenCalled();
    });
  });

  it('throws when project id route param is missing', () => {
    mockUseParams.mockReturnValue({ survey_id: '5' });

    expect(() =>
      render(
        <SurveyContextProvider>
          <SurveyContext.Consumer>{() => <></>}</SurveyContext.Consumer>
        </SurveyContextProvider>
      )
    ).toThrow(
      "The project ID found in SurveyContextProvider was invalid. Does your current React route provide an 'id' parameter?"
    );
  });

  it('throws when survey id route param is missing', () => {
    mockUseParams.mockReturnValue({ id: '1' });

    expect(() =>
      render(
        <SurveyContextProvider>
          <SurveyContext.Consumer>{() => <></>}</SurveyContext.Consumer>
        </SurveyContextProvider>
      )
    ).toThrow(
      "The survey ID found in SurveyContextProvider was invalid. Does your current React route provide a 'survey_id' parameter?"
    );
  });
});
