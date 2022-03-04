import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicIUCNClassification from './PublicIUCNClassification';

const mockRefresh = jest.fn();

describe('PublicIUCNClassification', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicIUCNClassification projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
