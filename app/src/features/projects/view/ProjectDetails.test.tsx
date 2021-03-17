import { render } from '@testing-library/react';
import { codes } from 'test-helpers/projectCodes';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import ProjectDetails from './ProjectDetails';

describe('ProjectDetails', () => {
  it('renders correctly', () => {
    projectWithDetailsData.location.geometry.push({
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

    const { asFragment } = render(<ProjectDetails projectWithDetailsData={projectWithDetailsData} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
