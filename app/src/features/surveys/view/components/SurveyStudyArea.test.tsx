import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { geoJsonFeature } from 'test-helpers/spatial-helpers';
import { getSurveyForViewResponse, surveyObject, surveySupplementaryData } from 'test-helpers/survey-helpers';
import SurveyStudyArea from './SurveyStudyArea';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveyForView: jest.fn<Promise<IGetSurveyForViewResponse>, []>(),
    updateSurvey: jest.fn()
  },
  external: {
    post: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

describe('SurveyStudyArea', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.getSurveyForView.mockClear();
    mockBiohubApi().survey.updateSurvey.mockClear();
    mockBiohubApi().external.post.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  mockBiohubApi().external.post.mockResolvedValue({
    features: []
  });

  it('renders correctly with no data', async () => {
    const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

    const { container } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationsDataLoader,
          summaryDataLoader: mockSummaryDataLoader
        }}>
        <SurveyStudyArea />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(container).toBeVisible();
    });
  });

  describe('zoom to initial extent button', async () => {
    it('is not rendered if there are no geometries on the map', async () => {
      const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

      const { container, getByTestId } = render(
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            observationDataLoader: mockObservationsDataLoader,
            summaryDataLoader: mockSummaryDataLoader
          }}>
          <SurveyStudyArea />
        </SurveyContext.Provider>
      );

      await waitFor(() => {
        expect(container).toBeVisible();
        expect(getByTestId('survey_map_center_button')).not.toBeInTheDocument();
      });
    });

    it('is rendered if there are geometries on the map', async () => {
      const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
      const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

      const { container, getByTestId } = render(
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            observationDataLoader: mockObservationsDataLoader,
            summaryDataLoader: mockSummaryDataLoader
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

  it.skip('does not display the zoom to initial extent button if there are not geometries', async () => {
    const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByText, queryByText } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationsDataLoader,
          summaryDataLoader: mockSummaryDataLoader
        }}>
        <SurveyStudyArea />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id
      );
    });

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
      expect(mockBiohubApi().survey.updateSurvey).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id,
        {
          location: {
            survey_area_name: 'study area is this',
            geoJsonFeature,
            revision_count: 0
          }
        }
      );

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it.skip('displays an error dialog when fetching the update data fails', async () => {
    const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

    mockBiohubApi().survey.getSurveyForView.mockResolvedValue((null as unknown) as any);

    const { getByText, queryByText } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationsDataLoader,
          summaryDataLoader: mockSummaryDataLoader
        }}>
        <SurveyStudyArea />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Survey Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Survey Study Area')).not.toBeInTheDocument();
    });
  });

  it.skip('shows error dialog with API error message when getting survey data for update fails', async () => {
    const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

    mockBiohubApi().survey.getSurveyForView = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationsDataLoader,
          summaryDataLoader: mockSummaryDataLoader
        }}>
        <SurveyStudyArea />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it.skip('shows error dialog with API error message when updating survey data fails', async () => {
    const mockSurveyDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        survey_details: {
          id: 1,
          project_id: 1,
          survey_name: 'survey name is this',
          start_date: '1999-09-09',
          end_date: '2021-01-25',
          biologist_first_name: 'firstttt',
          biologist_last_name: 'lastttt',
          survey_area_name: 'study area is this',
          geometry: [geoJsonFeature],
          revision_count: 0
        }
      },
      surveySupplementaryData: surveySupplementaryData
    });
    mockBiohubApi().survey.updateSurvey = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationsDataLoader,
          summaryDataLoader: mockSummaryDataLoader
        }}>
        <SurveyStudyArea />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id
      );
    });

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
