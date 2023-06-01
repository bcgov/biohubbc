import {
  cleanup,
  fireEvent,
  getByTestId as rawGetByTestId,
  queryByTestId as rawQueryByTestId,
  render,
  waitFor
} from '@testing-library/react';
import { AttachmentType } from 'constants/attachments';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import ProjectAttachments from './ProjectAttachments';

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn(),
    getProjectAttachments: jest.fn(),
    deleteProjectAttachment: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

describe('ProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectAttachments.mockClear();
    mockBiohubApi().project.deleteProjectAttachment.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('correctly opens and closes the file upload dialog', async () => {
    const mockProjectContext: IProjectContext = ({
      artifactDataLoader: ({
        data: null,
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: ({
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>
    } as unknown) as IProjectContext;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const { getByText, queryByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <ProjectAttachments />
          </ProjectContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Upload')).toBeInTheDocument();
      expect(queryByText('Upload Attachment')).toBeNull();
    });

    fireEvent.click(getByText('Upload'));

    await waitFor(() => {
      expect(getByText('Upload Attachments')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Upload Attachments'));

    expect(getByText('Close')).toBeInTheDocument();
  });

  it('renders correctly with no attachments', async () => {
    const mockProjectContext: IProjectContext = ({
      artifactDataLoader: ({
        data: null,
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: ({
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>
    } as unknown) as IProjectContext;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const { getByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <ProjectAttachments />
          </ProjectContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );
    await waitFor(() => {
      expect(getByText('No Documents')).toBeInTheDocument();
    });
  });

  it('renders correctly with attachments', async () => {
    const mockProjectContext: IProjectContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: ({
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>
    } as unknown) as IProjectContext;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const { getByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <ProjectAttachments />
          </ProjectContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('deletes an attachment from the attachments list as expected', async () => {
    const deleteProjectAttachmentStub = mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
    const mockProjectContext: IProjectContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename1.test',
              fileType: AttachmentType.OTHER,
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            },
            {
              id: 2,
              fileName: 'filename2.test',
              fileType: AttachmentType.REPORT,
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: ({
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>
    } as unknown) as IProjectContext;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { baseElement, queryByText, getByTestId, getAllByTestId, queryByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <DialogContextProvider>
              <ProjectContext.Provider value={mockProjectContext}>
                <ProjectAttachments />
              </ProjectContext.Provider>
            </DialogContextProvider>
          </ProjectAuthStateContext.Provider>
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(queryByText('filename1.test')).toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(queryByText('filename2.test')).toBeInTheDocument();
      expect(deleteProjectAttachmentStub).toBeCalledTimes(1);
    });
  });

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
    const mockProjectContext: IProjectContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: ({
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>
    } as unknown) as IProjectContext;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { baseElement, queryByText, getByTestId, queryByTestId, getAllByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <DialogContextProvider>
              <ProjectContext.Provider value={mockProjectContext}>
                <ProjectAttachments />
              </ProjectContext.Provider>
            </DialogContextProvider>
          </ProjectAuthStateContext.Provider>
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('no-button'));

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user clicks outside the dialog', async () => {
    mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
    const mockProjectContext: IProjectContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: ({
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>
    } as unknown) as IProjectContext;

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { baseElement, queryByText, getAllByRole, queryByTestId, getAllByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <DialogContextProvider>
              <ProjectContext.Provider value={mockProjectContext}>
                <ProjectAttachments />
              </ProjectContext.Provider>
            </DialogContextProvider>
          </ProjectAuthStateContext.Provider>
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    const background = getAllByRole('presentation')[0].firstChild;

    if (!background) {
      fail('Failed to click background.');
    }

    fireEvent.click(background);

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });
});
