import { render } from '@testing-library/react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import { codes } from 'test-helpers/projectCodes';
import React from 'react';
import GeneralInformation from './GeneralInformation';

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<GeneralInformation projectWithDetailsData={projectWithDetailsData} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
