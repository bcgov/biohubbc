import { render } from '@testing-library/react';
import { IGetProjectSurvey } from 'interfaces/useProjectApi.interface';
import React from 'react';
import SurveysList from './SurveysList';

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

    const { asFragment } = render(<SurveysList surveysList={surveysList} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with no surveys', () => {
    const { asFragment } = render(<SurveysList surveysList={[]} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
