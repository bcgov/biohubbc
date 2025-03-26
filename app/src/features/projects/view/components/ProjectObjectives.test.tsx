import { DialogContextProvider } from 'contexts/dialogContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { DataLoader } from 'hooks/useDataLoader';
import { cleanup, fireEvent, render } from 'test-helpers/test-utils';
import ProjectObjectives from './ProjectObjectives';

describe('ProjectObjectives', () => {
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
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          projectData: {
            objectives: {
              objectives: 'Lorem ipsum dolor sit amet'
            }
          }
        },
        load: vi.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { getByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectObjectives />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    expect(getByText('Lorem ipsum dolor sit amet')).toBeInTheDocument();
  });

  it('renders correctly when objectives length is > 850 characters ', () => {
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          projectData: {
            objectives: {
              objectives: longData
            }
          }
        },
        load: vi.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { getByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectObjectives />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    expect(getByText('Read More')).toBeInTheDocument();
  });

  it('toggles as expected with the Read More and Read Less buttons', () => {
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          projectData: {
            objectives: {
              objectives: longData
            }
          }
        },
        load: vi.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { getAllByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectObjectives />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    //@ts-ignore
    expect(getAllByText('Read More')[0]).toBeInTheDocument();
    //@ts-ignore
    fireEvent.click(getAllByText('Read More')[0]);
    //@ts-ignore
    expect(getAllByText('Read Less')[0]).toBeInTheDocument();
    //@ts-ignore
    fireEvent.click(getAllByText('Read Less')[0]);
    //@ts-ignore
    expect(getAllByText('Read More')[0]).toBeInTheDocument();
  });

  it('toggles as expected if the text contains no spaces', () => {
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          projectData: {
            objectives: {
              objectives: longData
            }
          }
        },
        load: vi.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { getAllByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectObjectives />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    //@ts-ignore
    expect(getAllByText('Read More')[0]).toBeInTheDocument();
    //@ts-ignore
    fireEvent.click(getAllByText('Read More')[0]);
    //@ts-ignore
    expect(getAllByText('Read Less')[0]).toBeInTheDocument();
    //@ts-ignore
    fireEvent.click(getAllByText('Read Less')[0]);
    //@ts-ignore
    expect(getAllByText('Read More')[0]).toBeInTheDocument();
  });

  it('does not show the Read More or Read Less buttons if text is not long enough', () => {
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          projectData: {
            objectives: {
              objectives: 'Lorem ipsum dolor sit amet'
            }
          }
        },
        load: vi.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { queryByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectObjectives />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    //@ts-ignore
    expect(queryByText('Read More')).not.toBeInTheDocument();

    //@ts-ignore
    expect(queryByText('Read Less')).not.toBeInTheDocument();
  });

  it('does not show the Read More or Read Less buttons if text is empty', () => {
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          projectData: {
            objectives: {
              objectives: ''
            }
          }
        },
        load: vi.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { queryByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectObjectives />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    //@ts-ignore
    expect(queryByText('Read More')).not.toBeInTheDocument();

    //@ts-ignore
    expect(queryByText('Read Less')).not.toBeInTheDocument();
  });
});
