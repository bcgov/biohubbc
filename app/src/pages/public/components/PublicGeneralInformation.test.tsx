import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicGeneralInformation from './PublicGeneralInformation';

const mockRefresh = jest.fn();

describe('PublicGeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <PublicGeneralInformation projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
