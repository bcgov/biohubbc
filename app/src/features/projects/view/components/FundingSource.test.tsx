import { render } from '@testing-library/react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import FundingSource from './FundingSource';

describe('FundingSource', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<FundingSource projectWithDetailsData={projectWithDetailsData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
