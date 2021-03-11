import { render, getByText } from '@testing-library/react';
import React from 'react';
import ProjectsLayout from './ProjectsLayout';

describe('ProjectsLayout', () => {
  it('matches the snapshot', () => {
    const { container, asFragment } = render(
      <ProjectsLayout>
        <p>This is project layout test child component</p>
      </ProjectsLayout>
    );

    //@ts-ignore
    expect(getByText(container, 'This is project layout test child component')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
