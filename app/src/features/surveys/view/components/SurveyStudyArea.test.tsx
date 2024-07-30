import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { getSurveyForViewResponse, surveyObject, surveySupplementaryData } from 'test-helpers/survey-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import SurveyStudyArea from './SurveyStudyArea';

vi.mock('../../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  survey: {
    getSurveyForView: vi.fn(),
    updateSurvey: vi.fn()
  },
  spatial: {
    getRegions: vi.fn()
  }
};

describe.skip('SurveyStudyArea', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.survey.getSurveyForView.mockClear();
    mockUseApi.survey.updateSurvey.mockClear();
    mockUseApi.spatial.getRegions.mockClear();

    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });

    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no data', async () => {
    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockTechniqueDataLoader = { data: [] } as DataLoader<any, any, any>;

    const { container } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          critterDeployments: [],
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          techniqueDataLoader: mockTechniqueDataLoader,
          sampleSiteDataLoader: mockSampleSiteDataLoader,
          critterDataLoader: mockCritterDataLoader,
          deploymentDataLoader: mockDeploymentDataLoader
        }}>
        <SurveyStudyArea />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(container).toBeVisible();
    });
  });

  describe('zoom to initial extent button', () => {
    it('is not rendered if there are no geometries on the map', async () => {
      const mockSurveyDataLoader = {
        data: {
          ...getSurveyForViewResponse,
          surveyData: {
            ...getSurveyForViewResponse.surveyData,
            survey_details: { ...getSurveyForViewResponse.surveyData.survey_details, geojson: [] }
          }
        }
      } as DataLoader<any, any, any>;
      const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
      const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;
      const mockTechniqueDataLoader = { data: [] } as DataLoader<any, any, any>;

      const { container, queryByTestId } = render(
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            critterDeployments: [],
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            sampleSiteDataLoader: mockSampleSiteDataLoader,
            techniqueDataLoader: mockTechniqueDataLoader,
            critterDataLoader: mockCritterDataLoader,
            deploymentDataLoader: mockDeploymentDataLoader
          }}>
          <SurveyStudyArea />
        </SurveyContext.Provider>
      );

      await waitFor(() => {
        expect(container).toBeVisible();
        expect(queryByTestId('survey_map_center_button')).toBeInTheDocument();
      });
    });

    it('is rendered if there are geometries on the map', async () => {
      const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, any, any>;
      const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
      const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;
      const mockTechniqueDataLoader = { data: [] } as DataLoader<any, any, any>;

      const { container, getByTestId } = render(
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            critterDeployments: [],
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            sampleSiteDataLoader: mockSampleSiteDataLoader,
            critterDataLoader: mockCritterDataLoader,
            deploymentDataLoader: mockDeploymentDataLoader,
            techniqueDataLoader: mockTechniqueDataLoader
          }}>
          <SurveyStudyArea />
        </SurveyContext.Provider>
      );

      await waitFor(() => {
        expect(container).toBeVisible();
        expect(getByTestId('survey_map_center_button')).toBeVisible();
      });
    });
  });

  it('does not display the zoom to initial extent button if there are not geometries', async () => {
    const mockSurveyDataLoader = {
      data: getSurveyForViewResponse,
      refresh: vi.fn() as unknown as any
    } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockTechniqueDataLoader = { data: [] } as DataLoader<any, any, any>;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const { getByText, queryByText } = render(
      <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            critterDeployments: [],
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            sampleSiteDataLoader: mockSampleSiteDataLoader,
            critterDataLoader: mockCritterDataLoader,
            deploymentDataLoader: mockDeploymentDataLoader,
            techniqueDataLoader: mockTechniqueDataLoader
          }}>
          <SurveyStudyArea />
        </SurveyContext.Provider>
      </ProjectAuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Survey Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Survey Study Area')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Survey Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUseApi.survey.updateSurvey).toBeCalledWith(1, getSurveyForViewResponse.surveyData.survey_details.id, {
        locations: [
          {
            survey_location_id: 1,
            geojson: [
              {
                geometry: {
                  coordinates: [
                    [
                      [-128, 55],
                      [-128, 55.5],
                      [-128, 56],
                      [-126, 58],
                      [-128, 55]
                    ]
                  ],
                  type: 'Polygon'
                },
                id: 'myGeo',
                properties: {
                  name: 'Biohub Islands'
                },
                type: 'Feature'
              }
            ],
            revision_count: 0,
            name: 'study area',
            description: 'study area description'
          }
        ]
      });
    });
  });

  it('shows error dialog with API error message when updating survey data fails', async () => {
    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockTechniqueDataLoader = { data: [] } as DataLoader<any, any, any>;

    mockUseApi.survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        survey_details: {
          id: 1,
          project_id: 1,
          survey_name: 'survey name is this',
          start_date: '1999-09-09',
          end_date: '2021-01-25',
          progress_id: 1,
          survey_types: [1],
          revision_count: 0
        }
      },
      surveySupplementaryData: surveySupplementaryData
    });
    mockUseApi.survey.updateSurvey = vi.fn(() => Promise.reject(new Error('API Error is Here')));

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const { getByText, queryByText } = render(
      <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            critterDeployments: [],
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            sampleSiteDataLoader: mockSampleSiteDataLoader,
            critterDataLoader: mockCritterDataLoader,
            techniqueDataLoader: mockTechniqueDataLoader,
            deploymentDataLoader: mockDeploymentDataLoader
          }}>
          <SurveyStudyArea />
        </SurveyContext.Provider>
      </ProjectAuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Survey Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });
});
