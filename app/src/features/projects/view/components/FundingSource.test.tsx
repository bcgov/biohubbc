import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import FundingSource from './FundingSource';
import { codes } from 'test-helpers/code-helpers';
jest.mock('../../../../hooks/useBioHubApi');
const mockRefresh = jest.fn();

describe('FundingSource', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
