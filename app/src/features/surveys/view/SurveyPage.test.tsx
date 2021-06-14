import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyPage from './SurveyPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1/surveys/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  survey: {
    getSurveyForView: jest.fn<Promise<IGetSurveyForViewResponse>, [number]>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SurveyPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveyForView.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment } = render(
      <Router history={history}>
        <SurveyPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no codes is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const { asFragment } = render(
      <Router history={history}>
        <SurveyPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no survey is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment } = render(
      <Router history={history}>
        <SurveyPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders survey page when survey is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment, findByText } = render(
      <Router history={history}>
        <SurveyPage />
      </Router>
    );

    const surveyHeaderText = await findByText('survey name', { selector: 'h1' });

    await waitFor(() => {
      expect(surveyHeaderText).toBeVisible();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with no end date', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      ...getSurveyForViewResponse,
      survey_details: {
        ...getSurveyForViewResponse.survey_details,
        end_date: (null as unknown) as string
      }
    });
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment, findByText } = render(
      <Router history={history}>
        <SurveyPage />
      </Router>
    );

    const surveyHeaderText = await findByText('survey name', { selector: 'h1' });

    await waitFor(() => {
      expect(surveyHeaderText).toBeVisible();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
