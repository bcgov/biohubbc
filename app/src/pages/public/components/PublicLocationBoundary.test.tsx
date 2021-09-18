import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicLocationBoundary from './PublicLocationBoundary';

const mockRefresh = jest.fn();

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('PublicLocationBoundary', () => {
  it('renders correctly', async () => {
    const { asFragment } = render(
      <PublicLocationBoundary projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
