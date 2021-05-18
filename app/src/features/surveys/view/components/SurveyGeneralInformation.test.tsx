import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { getProjectSurveyForViewResponse } from 'test-helpers/survey-helpers';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import SurveyGeneralInformation from './SurveyGeneralInformation';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getSurveyForUpdate: jest.fn(),
    updateSurvey: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <SurveyGeneralInformation
      projectId={1}
      surveyForViewData={getProjectSurveyForViewResponse}
      codes={codes}
      refresh={mockRefresh}
    />
  );
};

describe('SurveyGeneralInformation', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getSurveyForUpdate.mockClear();
    mockBiohubApi().project.updateSurvey.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no end date (only start date)', () => {
    const { asFragment } = render(
      <SurveyGeneralInformation
        surveyForViewData={{
          ...getProjectSurveyForViewResponse,
          survey: {
            ...getProjectSurveyForViewResponse.survey,
            end_date: (null as unknown) as string,
            species: ['species 1']
          }
        }}
        codes={codes}
        refresh={mockRefresh}
        projectId={1}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with all fields', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the project details works in the dialog', async () => {
    mockBiohubApi().project.getSurveyForUpdate.mockResolvedValue({
      survey_name: 'survey name is this',
      survey_purpose: 'survey purpose is this',
      species: ['species 1'],
      start_date: '1998-11-11',
      end_date: '2021-03-27',
      biologist_first_name: 'firstttt',
      biologist_last_name: 'lastttt',
      survey_area_name: 'study area is this',
      revision_count: 1
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getSurveyForUpdate).toBeCalledWith(1, getProjectSurveyForViewResponse.id);
    });

    await waitFor(() => {
      expect(getByText('Edit Survey General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Survey General Information')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Survey General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().project.updateSurvey).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().project.updateSurvey).toBeCalledWith(1, getProjectSurveyForViewResponse.id, {
        survey_name: 'survey name is this',
        survey_purpose: 'survey purpose is this',
        species: ['species 1'],
        start_date: '1998-11-11',
        end_date: '2021-03-27',
        biologist_first_name: 'firstttt',
        biologist_last_name: 'lastttt',
        survey_area_name: 'study area is this',
        revision_count: 1
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().project.getSurveyForUpdate.mockResolvedValue(null);

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Survey General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Survey General Information')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting survey data for update fails', async () => {
    mockBiohubApi().project.getSurveyForUpdate = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
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
    mockBiohubApi().project.getSurveyForUpdate.mockResolvedValue({
      survey_name: 'survey name is this',
      survey_purpose: 'survey purpose is this',
      species: ['species 1'],
      start_date: '1998-11-11',
      end_date: '2021-03-27',
      biologist_first_name: 'firstttt',
      biologist_last_name: 'lastttt',
      survey_area_name: 'study area is this',
      revision_count: 1
    });
    mockBiohubApi().project.updateSurvey = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getSurveyForUpdate).toBeCalledWith(1, getProjectSurveyForViewResponse.id);
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
