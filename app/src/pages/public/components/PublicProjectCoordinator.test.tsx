import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectCoordinator from './PublicProjectCoordinator';

const mockRefresh = jest.fn();

describe('PublicProjectCoordinator', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicProjectCoordinator projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
