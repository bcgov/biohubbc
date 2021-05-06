import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetails from './ProjectDetails';

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
      <ProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
