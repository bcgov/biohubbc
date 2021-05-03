import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ProjectSurveysListPage from './ProjectSurveysListPage';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

const history = createMemoryHistory();

describe('ProjectSurveysListPage', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Router history={history}>
        <ProjectSurveysListPage projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(getByText('Surveys')).toBeInTheDocument();
    expect(getByText('Create Survey')).toBeInTheDocument();
    expect(getByText('Moose Survey 1')).toBeInTheDocument();
  });
});
