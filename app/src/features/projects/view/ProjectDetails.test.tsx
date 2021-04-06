import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetails from './ProjectDetails';

const history = createMemoryHistory();

describe('ProjectDetails', () => {
  it('renders correctly', () => {
    getProjectForViewResponse.location.geometry.push({
      id: 'myGeo',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [125.6, 10.1]
      },
      properties: {
        name: 'Dinagat Islands'
      }
    });

    const { asFragment } = render(
      <Router history={history}>
        <ProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
