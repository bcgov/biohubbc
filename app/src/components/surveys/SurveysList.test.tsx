import { render } from '@testing-library/react';
import { IGetProjectSurvey } from 'interfaces/useProjectApi.interface';
import React from 'react';
import SurveysList from './SurveysList';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';

const history = createMemoryHistory();

describe('SurveysList', () => {
  it('renders correctly with surveys', () => {
    const surveysList: IGetProjectSurvey[] = [
      {
        id: 1,
        name: 'Moose Survey 1',
        species: 'Moose',
        start_date: '2021-04-09 11:53:53',
        end_date: '2021-05-09 11:53:53',
        status_name: 'Unpublished'
      },
      {
        id: 2,
        name: 'Moose Survey 2',
        species: 'Moose',
        start_date: '2021-04-09 11:53:53',
        end_date: '2021-06-10 11:53:53',
        status_name: 'Published'
      }
    ];

    const { getByText, queryByText } = render(
      <Router history={history}>
        <SurveysList surveysList={surveysList} />
      </Router>
    );

    expect(queryByText('No Surveys')).toBeNull();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
    expect(getByText('Moose Survey 2')).toBeInTheDocument();
  });

  it('renders correctly with no surveys', () => {
    const { getByText } = render(
      <Router history={history}>
        <SurveysList surveysList={[]} />
      </Router>
    );

    expect(getByText('No Surveys')).toBeInTheDocument();
  });
});
