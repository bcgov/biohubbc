import { render, fireEvent, getByText } from '@testing-library/react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React from 'react';
import ProjectObjectives from './ProjectObjectives';

const projectWithDetailsData: IProjectWithDetails = {
  id: 1,
  project: {
    project_name: 'Test Project Name',
    project_type: '1',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    climate_change_initiatives: [],
    project_activities: []
  },
  location: {
    location_description: 'here and there',
    regions: [],
    geometry: []
  },
  objectives: {
    objectives: 'Et ad et in culpa si',
    caveats: 'sjwer bds'
  }
};

describe('ProjectObjectives', () => {
  const longObjectives =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' +
    'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation' +
    'ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in' +
    'voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,' +
    'sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur' +
    'adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
    'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor' +
    'in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. This is the way we can' +
    'assert that our long strings work as expected with objectives.';

  it('renders correctly when objectives length is <= 850 characters', () => {
    const { asFragment } = render(<ProjectObjectives projectWithDetailsData={projectWithDetailsData} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives length is > 850 characters', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: { ...projectWithDetailsData.objectives, objectives: longObjectives }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives are in multiple paragraphs', () => {
    const multilineObjectives = 'Paragraph1\nParagraph2\n\nParagraph3';

    const { asFragment } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: { ...projectWithDetailsData.objectives, objectives: multilineObjectives }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('allows to read more to enable viewing the entire objectives string and read less to only show the truncated string', () => {
    const { container } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: { ...projectWithDetailsData.objectives, objectives: longObjectives }
        }}
      />
    );

    //@ts-ignore
    expect(getByText(container, 'Read More')).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getByText(container, 'Read More'));

    //@ts-ignore
    expect(getByText(container, 'Read Less')).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getByText(container, 'Read Less'));

    //@ts-ignore
    expect(getByText(container, 'Read More')).toBeInTheDocument();
  });
});
