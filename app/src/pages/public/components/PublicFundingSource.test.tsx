import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicFundingSource from './PublicFundingSource';

const mockRefresh = jest.fn();

describe('PublicFundingSource', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicFundingSource projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
