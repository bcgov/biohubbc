import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ProjectSurveysListPage from './ProjectSurveysListPage';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

const history = createMemoryHistory();

describe('ProjectSurveysListPage', () => {
  it('renders correctly with no projectForViewData', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectSurveysListPage projectForViewData={(null as unknown) as IGetProjectForViewResponse}/>
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
