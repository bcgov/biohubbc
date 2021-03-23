import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ProjectCoordinator from './ProjectCoordinator';

describe('ProjectCoordinator', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectCoordinator projectForViewData={getProjectForViewResponse} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
