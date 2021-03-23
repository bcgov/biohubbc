import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import IUCNClassification from './IUCNClassification';

describe('IUCNClassification', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<IUCNClassification projectForViewData={getProjectForViewResponse} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
