import { render } from '@testing-library/react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import ProjectCoordinator from './ProjectCoordinator';

describe('ProjectCoordinator', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectCoordinator projectWithDetailsData={projectWithDetailsData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
