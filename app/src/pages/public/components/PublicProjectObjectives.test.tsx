import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectObjectives from './PublicProjectObjectives';

const mockRefresh = jest.fn();

describe('PublicProjectObjectives', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <PublicProjectObjectives projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(getByText('Objectives')).toBeInTheDocument();
    expect(getByText('Caveats')).toBeInTheDocument();
  });
});
