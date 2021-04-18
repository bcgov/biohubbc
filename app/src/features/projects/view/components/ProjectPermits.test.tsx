import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPermits from './ProjectPermits';

describe('ProjectPermits', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectPermits projectForViewData={getProjectForViewResponse} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
