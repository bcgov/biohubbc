import { render } from '@testing-library/react';
import React from 'react';
import GeneralInformation from './GeneralInformation';

const projectData = {
  name: 'Test Project Name',
  start_date: '1998-10-10',
  end_date: '2021-02-26'
};

describe('GeneralInformation', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<GeneralInformation projectData={projectData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
