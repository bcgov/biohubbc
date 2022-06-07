import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyGeneralInformation from './SurveyGeneralInformation';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveyForView: jest.fn(),
    updateSurvey: jest.fn(),
    getSurveyPermits: jest.fn(),
    getSurveyFundingSources: jest.fn()
  },
  taxonomy: {
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <SurveyGeneralInformation
      projectForViewData={getProjectForViewResponse}
      surveyForViewData={getSurveyForViewResponse}
      codes={codes}
      refresh={mockRefresh}
    />
  );
};

describe('SurveyGeneralInformation', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.getSurveyForView.mockClear();
    mockBiohubApi().survey.updateSurvey.mockClear();
    mockBiohubApi().survey.getSurveyPermits.mockClear();
    mockBiohubApi().survey.getSurveyFundingSources.mockClear();
    mockBiohubApi().taxonomy.getSpeciesFromIds.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no end date (only start date)', () => {
    const { asFragment } = render(
      <SurveyGeneralInformation
        surveyForViewData={{
          ...getSurveyForViewResponse,
          survey_details: {
            ...getSurveyForViewResponse.survey_details,
            end_date: (null as unknown) as string,
            focal_species: [1],
            ancillary_species: [2]
          }
        }}
        codes={codes}
        refresh={mockRefresh}
        projectForViewData={getProjectForViewResponse}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with all fields', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the survey details works in the dialog', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      survey_details: {
        id: 1,
        survey_name: 'survey name is this',
        survey_purpose: 'survey purpose is this',
        focal_species: [1],
        focal_species_names: ['focal species 1'],
        ancillary_species: [2],
        ancillary_species_names: ['ancillary species 2'],
        common_survey_methodology_id: 1,
        start_date: '1999-09-09',
        end_date: '2021-01-25',
        biologist_first_name: 'firstttt',
        biologist_last_name: 'lastttt',
        survey_area_name: 'study area is this',
        geometry: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [125.6, 10.1]
          },
          properties: {
            name: 'Dinagat Islands'
          }
        },
        revision_count: 1
      }
    });
    mockBiohubApi().survey.getSurveyPermits.mockResolvedValue([
      { number: '123', type: 'Scientific' },
      { number: '456', type: 'Wildlife' }
    ]);
    mockBiohubApi().survey.getSurveyFundingSources.mockResolvedValue([
      { pfsId: 1, amount: 100, startDate: '2000-04-09 11:53:53', endDate: '2000-05-10 11:53:53', agencyName: 'agency' }
    ]);

    const { getByText, getByTestId, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByTestId('edit-general-info'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(1, getSurveyForViewResponse.survey_details.id, [
        'survey_details'
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Survey General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Survey General Information')).not.toBeInTheDocument();
    });

    fireEvent.click(getByTestId('edit-general-info'));

    await waitFor(() => {
      expect(getByText('Edit Survey General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.updateSurvey).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().survey.updateSurvey).toBeCalledWith(1, getSurveyForViewResponse.survey_details.id, {
        survey_details: {
          id: 1,
          survey_name: 'survey name is this',
          survey_purpose: 'survey purpose is this',
          focal_species: [1],
          focal_species_names: ['focal species 1'],
          ancillary_species: [2],
          ancillary_species_names: ['ancillary species 2'],
          common_survey_methodology_id: 1,
          start_date: '1999-09-09',
          end_date: '2021-01-25',
          biologist_first_name: 'firstttt',
          biologist_last_name: 'lastttt',
          survey_area_name: 'study area is this',
          revision_count: 1,
          geometry: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1]
            },
            properties: {
              name: 'Dinagat Islands'
            }
          },
          permit_type: ''
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(null);

    const { getByText, getByTestId, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByTestId('edit-general-info'));

    await waitFor(() => {
      expect(getByText('Error Editing Survey General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Survey General Information')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting survey data for update fails', async () => {
    mockBiohubApi().survey.getSurveyForView = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, getByTestId, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByTestId('edit-general-info'));

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
      survey_details: {
        id: 1,
        survey_name: 'survey name is this',
        survey_purpose: 'survey purpose is this',
        focal_species: ['species 1'],
        ancillary_species: ['ancillary species'],
        common_survey_methodology_id: 1,
        start_date: '1999-09-09',
        end_date: '2021-01-25',
        biologist_first_name: 'firstttt',
        biologist_last_name: 'lastttt',
        survey_area_name: 'study area is this',
        revision_count: 1
      }
    });
    mockBiohubApi().survey.getSurveyPermits.mockResolvedValue([
      { number: '123', type: 'Scientific' },
      { number: '456', type: 'Wildlife' }
    ]);
    mockBiohubApi().survey.getSurveyFundingSources.mockResolvedValue([
      { pfsId: 1, amount: 100, startDate: '2000-04-09 11:53:53', endDate: '2000-05-10 11:53:53', agencyName: 'agency' }
    ]);
    mockBiohubApi().survey.updateSurvey = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, getByTestId, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByTestId('edit-general-info'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(1, getSurveyForViewResponse.survey_details.id, [
        'survey_details'
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Survey General Information')).toBeVisible();
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
