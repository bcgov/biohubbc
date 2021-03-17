import { render } from '@testing-library/react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import IUCNClassification from './IUCNClassification';

describe('IUCNClassification', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<IUCNClassification projectWithDetailsData={projectWithDetailsData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
