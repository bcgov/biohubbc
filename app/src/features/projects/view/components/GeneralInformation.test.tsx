import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { codes } from 'test-helpers/code-helpers';
import React from 'react';
import GeneralInformation from './GeneralInformation';

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<GeneralInformation projectForViewData={getProjectForViewResponse} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
