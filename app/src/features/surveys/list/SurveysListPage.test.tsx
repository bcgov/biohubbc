import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import SurveysListPage from './SurveysListPage';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveysList: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SurveysListPage', () => {
  beforeEach(() => {
    mockBiohubApi().survey.getSurveysList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with an empty list of surveys', async () => {
    mockBiohubApi().survey.getSurveysList.mockResolvedValue([]);

    const { getByText } = render(
      <Router history={history}>
        <SurveysListPage projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('No Surveys')).toBeInTheDocument();
    });
  });

  it('renders correctly with a populated list of surveys', async () => {
    const surveysList: IGetSurveysListResponse[] = [
      {
        id: 1,
        name: 'Moose Survey 1',
        species: ['Moose'],
        start_date: '2021-04-09 11:53:53',
        end_date: '2021-05-09 11:53:53',
        status_name: 'Unpublished'
      },
      {
        id: 2,
        name: 'Moose Survey 2',
        species: ['Moose'],
        start_date: '2021-04-09 11:53:53',
        end_date: '2021-06-10 11:53:53',
        status_name: 'Published'
      }
    ];

    mockBiohubApi().survey.getSurveysList.mockResolvedValue(surveysList);

    const { getByText } = render(
      <Router history={history}>
        <SurveysListPage projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('Moose Survey 1')).toBeInTheDocument();
      expect(getByText('Moose Survey 2')).toBeInTheDocument();
    });
  });
});
