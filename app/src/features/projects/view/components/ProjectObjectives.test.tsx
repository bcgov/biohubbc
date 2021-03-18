import { render, fireEvent, getAllByText } from '@testing-library/react';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import ProjectObjectives from './ProjectObjectives';

describe('ProjectObjectives', () => {
  const longData =
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

  it('renders correctly when objectives length is > 850 characters and caveats is empty', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: { ...projectWithDetailsData.objectives, objectives: longData, caveats: '' }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when both objectives and caveats have length is > 850 characters', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: { ...projectWithDetailsData.objectives, objectives: longData, caveats: longData }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives are in multiple paragraphs', () => {
    const multilineObjectives = 'Paragraph1\nParagraph2\n\nParagraph3';
    const multilineCaveats = 'Paragraph1\nParagraph2\n\nParagraph3';

    const { asFragment } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: {
            ...projectWithDetailsData.objectives,
            objectives: multilineObjectives,
            caveats: multilineCaveats
          }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('the read more and read less buttons are working', async () => {
    const { container } = render(
      <ProjectObjectives
        projectWithDetailsData={{
          ...projectWithDetailsData,
          objectives: { ...projectWithDetailsData.objectives, objectives: longData, caveats: longData }
        }}
      />
    );

    // for finding 'project objectives'
    //@ts-ignore
    expect(getAllByText(container, 'Read More')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read More')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read Less')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read Less')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read More')[0]).toBeInTheDocument();

    // for finding 'project caveats'
    //@ts-ignore
    expect(getAllByText(container, 'Read More')[1]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read More')[1]);

    //@ts-ignore
    expect(getAllByText(container, 'Read Less')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read Less')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read More')[1]).toBeInTheDocument();
  });
});
