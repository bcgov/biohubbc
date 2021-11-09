import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import React from 'react';
import SurveyStudyArea from './SurveyStudyArea';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { Feature } from 'geojson';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveyForUpdate: jest.fn(),
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

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('SurveyStudyArea', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.getSurveyForUpdate.mockClear();
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
    mockBiohubApi().survey.getSurveyForUpdate.mockResolvedValue({
      survey_details: {
        id: 1,
        survey_name: 'survey name is this',
        survey_purpose: 'survey purpose is this',
        focal_species: ['species 1'],
        ancillary_species: ['ancillary species'],
        start_date: '1999-09-09',
        end_date: '2021-01-25',
        biologist_first_name: 'firstttt',
        biologist_last_name: 'lastttt',
        survey_area_name: 'study area is this',
        geometry,
        revision_count: 1
      }
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForUpdate).toBeCalledWith(1, getSurveyForViewResponse.survey_details.id, [
        'survey_details'
      ]);
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
      expect(mockBiohubApi().survey.updateSurvey).toBeCalledWith(1, getSurveyForViewResponse.survey_details.id, {
        survey_details: {
          id: 1,
          survey_name: 'survey name is this',
          survey_purpose: 'survey purpose is this',
          focal_species: ['species 1'],
          ancillary_species: ['ancillary species'],
          start_date: '1999-09-09',
          end_date: '2021-01-25',
          biologist_first_name: 'firstttt',
          biologist_last_name: 'lastttt',
          permit_type: '',
          survey_area_name: 'study area is this',
          revision_count: 1,
          geometry
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().survey.getSurveyForUpdate.mockResolvedValue(null);

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
    mockBiohubApi().survey.getSurveyForUpdate = jest.fn(() => Promise.reject(new Error('API Error is Here')));

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
    mockBiohubApi().survey.getSurveyForUpdate.mockResolvedValue({
      survey_details: {
        id: 1,
        survey_name: 'survey name is this',
        survey_purpose: 'survey purpose is this',
        focal_species: ['species 1'],
        ancillary_species: ['ancillary species'],
        start_date: '1999-09-09',
        end_date: '2021-01-25',
        biologist_first_name: 'firstttt',
        biologist_last_name: 'lastttt',
        survey_area_name: 'study area is this',
        geometry,
        revision_count: 1
      }
    });
    mockBiohubApi().survey.updateSurvey = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Study Area')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForUpdate).toBeCalledWith(1, getSurveyForViewResponse.survey_details.id, [
        'survey_details'
      ]);
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
