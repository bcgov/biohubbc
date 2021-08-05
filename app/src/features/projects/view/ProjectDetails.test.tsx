import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetails from './ProjectDetails';

describe('ProjectDetails', () => {
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

  jest.spyOn(console, 'debug').mockImplementation(() => {});

  const component = <ProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />;

  it('renders correctly', async () => {
    const { asFragment } = render(component);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
