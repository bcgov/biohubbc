import { cleanup, fireEvent, getAllByText, queryByText, render } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectObjectives from './ProjectObjectives';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <ProjectObjectives projectForViewData={getProjectForViewResponse.projectData} />
    </DialogContextProvider>
  );
};

describe('ProjectObjectives', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const longData =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean' +
    ' commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient ' +
    'montes, nascetur ridiculus mus.\n Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.\n' +
    ' Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget,' +
    ' arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.\n\n' +
    'Nullam dictum felis eu pede mollis pretium. Integer tincidunt. \n Cras dapibus. Vivamus elementum\n' +
    ' semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.\n\n ' +
    'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius\n\n ' +
    'laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies\n ' +
    'nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper liber\n\n,' +
    'sit amet adipiscing sem neque sed ipsum. N\n\n';

  it('renders correctly when objectives length is <= 850 characters', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives length is > 850 characters and caveats is empty', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: { ...getProjectForViewResponse.projectData.objectives, objectives: longData }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when both objectives and caveats have length is > 850 characters and are in multiple paragraphs', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: { ...getProjectForViewResponse.projectData.objectives, objectives: longData }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives and caveats are < 850 characters and in multiple paragraphs', () => {
    const multilineObjectives = 'Paragraph1\nParagraph2\n\nParagraph3';

    const { asFragment } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: {
            ...getProjectForViewResponse.projectData.objectives,
            objectives: multilineObjectives
          }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('toggles as expected with the Read More and Read Less buttons', () => {
    const { container } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: { ...getProjectForViewResponse.projectData.objectives, objectives: longData }
        }}
      />
    );

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
  });

  it('toggles as expected if the text contains no spaces', () => {
    const { container } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: { ...getProjectForViewResponse.projectData.objectives, objectives: 'a'.repeat(400) }
        }}
      />
    );

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
  });

  it('does not show the Read More or Read Less buttons if text is not long enough', () => {
    const { container } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: { ...getProjectForViewResponse.projectData.objectives, objectives: 'short text' }
        }}
      />
    );

    //@ts-ignore
    expect(queryByText(container, 'Read More')).not.toBeInTheDocument();

    //@ts-ignore
    expect(queryByText(container, 'Read Less')).not.toBeInTheDocument();
  });

  it('does not show the Read More or Read Less buttons if text is not empty', () => {
    const { container } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          objectives: { ...getProjectForViewResponse.projectData.objectives, objectives: '' }
        }}
      />
    );

    //@ts-ignore
    expect(queryByText(container, 'Read More')).not.toBeInTheDocument();

    //@ts-ignore
    expect(queryByText(container, 'Read Less')).not.toBeInTheDocument();
  });
});
