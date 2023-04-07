import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SurveyViewObject } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { surveyObject } from 'test-helpers/survey-helpers';
import SurveysList from './SurveysList';

const history = createMemoryHistory();

describe('SurveysList', () => {
  it('renders correctly with surveys', () => {
    const surveysList: SurveyViewObject[] = [
      {
        ...surveyObject,
        survey_details: {
          ...surveyObject.survey_details,
          survey_name: 'Moose Survey 1',
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-05-09 11:53:53'
        },
        species: {
          focal_species: [1],
          focal_species_names: ['species 1'],
          ancillary_species: [2],
          ancillary_species_names: ['species 2']
        }
      },
      {
        ...surveyObject,
        survey_details: {
          ...surveyObject.survey_details,
          survey_name: 'Moose Survey 2',
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-06-10 11:53:53'
        },
        species: {
          focal_species: [3],
          focal_species_names: ['species 3'],
          ancillary_species: [4],
          ancillary_species_names: ['species 4']
        }
      }
    ];

    const { getByText, queryByText } = render(
      <Router history={history}>
        <SurveysList projectId={1} surveysList={surveysList} codes={codes} />
      </Router>
    );

    expect(queryByText('No Surveys')).toBeNull();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
    expect(getByText('Moose Survey 2')).toBeInTheDocument();
  });

  it('renders correctly with no surveys', () => {
    const { getByText } = render(
      <Router history={history}>
        <SurveysList projectId={1} surveysList={[]} codes={codes} />
      </Router>
    );

    expect(getByText('No Surveys')).toBeInTheDocument();
  });
});
