import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectPermits from './PublicProjectPermits';

const mockRefresh = jest.fn();

describe('PublicProjectPermits', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicProjectPermits projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
