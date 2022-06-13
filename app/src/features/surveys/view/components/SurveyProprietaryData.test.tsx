import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse, surveyObject, surveySupplementaryData } from 'test-helpers/survey-helpers';
import SurveyProprietaryData from './SurveyProprietaryData';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveyForView: jest.fn<Promise<IGetSurveyForViewResponse>, []>(),
    updateSurvey: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <SurveyProprietaryData
      projectForViewData={getProjectForViewResponse}
      surveyForViewData={getSurveyForViewResponse}
      codes={codes}
      refresh={mockRefresh}
    />
  );
};

describe('SurveyProprietaryData', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.getSurveyForView.mockClear();
    mockBiohubApi().survey.updateSurvey.mockClear();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the survey proprietary data works in the dialog (not proprietary data)', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        proprietor: null
      },
      surveySupplementaryData: surveySupplementaryData
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Proprietary Data')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id
      );
    });

    await waitFor(() => {
      expect(getByText('Edit Survey Proprietor')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Survey Proprietor')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Survey Proprietor')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.updateSurvey).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id,
        {
          proprietor: {
            survey_data_proprietary: 'false',
            proprietary_data_category: 0,
            proprietor_name: '',
            first_nations_id: 0,
            category_rationale: '',
            disa_required: 'false'
          }
        }
      );

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('editing the survey proprietary data works in the dialog (proprietary data)', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        proprietor: {
          proprietary_data_category_name: 'category name',
          proprietor_name: 'proprietor name',
          first_nations_id: 2,
          first_nations_name: 'First Nations Land',
          category_rationale: 'rationale',
          proprietor_type_id: 1,
          proprietor_type_name: 'Proprietor code 1',
          disa_required: true
        }
      },
      surveySupplementaryData: surveySupplementaryData
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Proprietary Data')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id
      );
    });

    await waitFor(() => {
      expect(getByText('Edit Survey Proprietor')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Survey Proprietor')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Survey Proprietor')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.updateSurvey).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id,
        {
          proprietor: {
            survey_data_proprietary: 'true',
            proprietary_data_category: 1,
            proprietor_name: 'proprietor name',
            first_nations_id: 2,
            category_rationale: 'rationale',
            disa_required: 'true'
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
      expect(getByText('Proprietary Data')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Survey Proprietor')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Survey Proprietor')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting survey proprietor data for update fails', async () => {
    mockBiohubApi().survey.getSurveyForView = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('Proprietary Data')).toBeVisible();
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

  it('shows error dialog with API error message when updating survey proprietor data fails', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      surveyData: {
        ...surveyObject,
        proprietor: {
          proprietary_data_category_name: 'category name',
          proprietor_name: 'proprietor name',
          first_nations_id: 2,
          first_nations_name: 'First Nations Land',
          category_rationale: 'rationale',
          proprietor_type_id: 1,
          proprietor_type_name: 'Proprietor code 1',
          disa_required: true
        }
      },
      surveySupplementaryData: surveySupplementaryData
    });
    mockBiohubApi().survey.updateSurvey = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Proprietary Data')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().survey.getSurveyForView).toBeCalledWith(
        1,
        getSurveyForViewResponse.surveyData.survey_details.id
      );
    });

    await waitFor(() => {
      expect(getByText('Edit Survey Proprietor')).toBeVisible();
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
