import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { SurveyViewObject } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { surveyObject } from 'test-helpers/survey-helpers';
import SurveysListPage from './SurveysListPage';

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
        <SurveysListPage projectForViewData={getProjectForViewResponse.projectData} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('No Surveys')).toBeInTheDocument();
    });
  });

  it('renders correctly with a populated list of surveys', async () => {
    const surveysList: SurveyViewObject[] = [
      {
        ...surveyObject,
        survey_details: {
          ...surveyObject.survey_details,
          id: 1,
          survey_name: 'Moose Survey 1',
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-05-09 11:53:53'
        },
        species: {
          focal_species: [1],
          focal_species_names: ['Moose'],
          ancillary_species: [2],
          ancillary_species_names: ['Elk']
        }
      },
      {
        ...surveyObject,
        survey_details: {
          ...surveyObject.survey_details,
          id: 2,
          survey_name: 'Moose Survey 2',
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-06-10 11:53:53'
        },
        species: {
          focal_species: [1],
          focal_species_names: ['Moose'],
          ancillary_species: [2],
          ancillary_species_names: ['Elk']
        }
      }
    ];

    mockBiohubApi().survey.getSurveysList.mockResolvedValue(surveysList);

    const { getByText } = render(
      <Router history={history}>
        <SurveysListPage projectForViewData={getProjectForViewResponse.projectData} />
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
