import { DialogContextProvider } from 'contexts/dialogContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { cleanup, render } from 'test-helpers/test-utils';
import ProjectCoordinator from './ProjectCoordinator';

describe('ProjectCoordinator', () => {
  beforeEach(() => {});

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    const mockProjectContext: IProjectContext = ({
      projectDataLoader: ({
        data: {
          projectData: {
            coordinator: {
              first_name: 'first_name',
              last_name: 'last_name',
              coordinator_agency: 'coordinator_agency',
              email_address: 'email_address'
            }
          }
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1
    } as unknown) as IProjectContext;

    const { getByText } = render(
      <DialogContextProvider>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectCoordinator />
        </ProjectContext.Provider>
      </DialogContextProvider>
    );

    expect(getByText('first_name last_name')).toBeInTheDocument();
    expect(getByText('coordinator_agency')).toBeInTheDocument();
    expect(getByText('email_address')).toBeInTheDocument();
  });
});
