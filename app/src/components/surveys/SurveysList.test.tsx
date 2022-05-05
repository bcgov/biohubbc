import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import SurveysList from './SurveysList';

const history = createMemoryHistory();

describe('SurveysList', () => {
  it('renders correctly with surveys', () => {
    const surveysList: IGetSurveysListResponse[] = [
      {
        id: 1,
        survey: {
          id: 1,
          name: 'Moose Survey 1',
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-05-09 11:53:53',
          publish_status: 'Published',
          completion_status: 'Completed'
        },
        species: {
          species: [1],
          species_names: ['Moose']
        }
      },
      {
        id: 2,
        survey: {
          id: 2,
          name: 'Moose Survey 2',
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-06-10 11:53:53',
          publish_status: 'Unpublished',
          completion_status: 'Active'
        },
        species: {
          species: [2],
          species_names: ['Wolf']
        }
      }
    ];

    const { getByText, queryByText } = render(
      <Router history={history}>
        <SurveysList projectId={1} surveysList={surveysList} />
      </Router>
    );

    expect(queryByText('No Surveys')).toBeNull();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
    expect(getByText('Moose Survey 2')).toBeInTheDocument();
  });

  it('renders correctly with no surveys', () => {
    const { getByText } = render(
      <Router history={history}>
        <SurveysList projectId={1} surveysList={[]} />
      </Router>
    );

    expect(getByText('No Surveys')).toBeInTheDocument();
  });
});
