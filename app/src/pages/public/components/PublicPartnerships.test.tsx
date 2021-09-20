import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicPartnerships from './PublicPartnerships';

const mockRefresh = jest.fn();

describe('PublicPartnerships', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicPartnerships projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
