import { render } from '@testing-library/react';
import React from 'react';
import ProjectDetails from './ProjectDetails';

const projectData = {
  name: 'Test Project Name',
  objectives: 'Et ad et in culpa si',
  start_date: '1998-10-10',
  end_date: '2021-02-26'
};

describe('ProjectDetails', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectDetails projectData={projectData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
