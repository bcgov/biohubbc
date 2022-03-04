import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicPartnerships from './PublicPartnerships';

const mockRefresh = jest.fn();

describe('PublicPartnerships', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicPartnerships projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
