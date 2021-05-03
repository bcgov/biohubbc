import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ProjectSurveysListPage from './ProjectSurveysListPage';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

const history = createMemoryHistory();

describe('ProjectSurveysListPage', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Router history={history}>
        <ProjectSurveysListPage projectForViewData={{ id: 1 } as IGetProjectForViewResponse} />
      </Router>
    );

    expect(getByText('Surveys')).toBeInTheDocument();
    expect(getByText('Create Survey')).toBeInTheDocument();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
  });
});
