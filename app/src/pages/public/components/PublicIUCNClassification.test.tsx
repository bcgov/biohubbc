import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicIUCNClassification from './PublicIUCNClassification';

const mockRefresh = jest.fn();

describe('PublicIUCNClassification', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicIUCNClassification projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
