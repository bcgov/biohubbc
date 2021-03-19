import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import FundingSource from './FundingSource';

describe('FundingSource', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<FundingSource projectForViewData={getProjectForViewResponse} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
