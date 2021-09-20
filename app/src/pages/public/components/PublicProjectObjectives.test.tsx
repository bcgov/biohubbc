import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectObjectives from './PublicProjectObjectives';

const mockRefresh = jest.fn();

describe('PublicProjectObjectives', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicProjectObjectives projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
