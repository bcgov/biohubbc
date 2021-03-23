import { render } from '@testing-library/react';
import { codes } from 'test-helpers/code-helpers';
import React from 'react';
import ProjectDetails from './ProjectDetails';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

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

    const { asFragment } = render(<ProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
