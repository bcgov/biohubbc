import { render } from '@testing-library/react';
import React from 'react';
import ProjectObjectives from './ProjectObjectives';

const projectData = {
  objectives: 'Et ad et in culpa si'
};

describe('ProjectObjectives', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectObjectives projectData={projectData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
