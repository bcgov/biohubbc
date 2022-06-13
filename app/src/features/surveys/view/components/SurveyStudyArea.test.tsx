import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
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

const renderContainer = () => {
  return render(
    <SurveyStudyArea
      projectForViewData={getProjectForViewResponse}
      surveyForViewData={getSurveyForViewResponse}
      refresh={mockRefresh}
    />
  );
};

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

  const geometry: Feature[] = [
    {
      type: 'Feature',
      id: 'myGeo',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-128, 55],
            [-128, 55.5],
            [-128, 56],
            [-126, 58],
            [-128, 55]
          ]
        ]
      },
      properties: {
        name: 'Biohub Islands'
      }
    }
  ];

  mockBiohubApi().external.post.mockResolvedValue({
    features: []
  });

  it('renders correctly', async () => {
    const { asFragment } = renderContainer();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('editing the survey details works in the dialog', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        survey_details: {
          id: 1,
          survey_name: 'survey name is this',
          start_date: '1999-09-09',
          end_date: '2021-01-25',
          biologist_first_name: 'firstttt',
          biologist_last_name: 'lastttt',
          publish_date: '',
          survey_area_name: 'study area is this',
          geometry,
          revision_count: 0
        }
      },
      surveySupplementaryData: surveySupplementaryData
    });

    const { getByText, queryByText } = renderContainer();

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
            geometry,
            revision_count: 0
          }
        }
      );

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue((null as unknown) as any);

    const { getByText, queryByText } = renderContainer();

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

  it('shows error dialog with API error message when getting survey data for update fails', async () => {
    mockBiohubApi().survey.getSurveyForView = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

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

  it('shows error dialog with API error message when updating survey data fails', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        survey_details: {
          id: 1,
          survey_name: 'survey name is this',
          start_date: '1999-09-09',
          end_date: '2021-01-25',
          biologist_first_name: 'firstttt',
          biologist_last_name: 'lastttt',
          survey_area_name: 'study area is this',
          publish_date: '',
          geometry,
          revision_count: 0
        }
      },
      surveySupplementaryData: surveySupplementaryData
    });
    mockBiohubApi().survey.updateSurvey = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = renderContainer();

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
