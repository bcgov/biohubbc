import { AttachmentType } from 'constants/attachments';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import {
  cleanup,
  fireEvent,
  getByTestId as rawGetByTestId,
  queryByTestId as rawQueryByTestId,
  render,
  waitFor
} from 'test-helpers/test-utils';
import SurveyAttachments from './SurveyAttachments';

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  survey: {
    getSurveyForView: jest.fn(),
    getSurveySummarySubmission: jest.fn(),
    getSurveyAttachments: jest.fn(),
    deleteSurveyAttachment: jest.fn()
  },
  observation: {
    getObservationSubmission: jest.fn()
  }
};

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

describe('SurveyAttachments', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.survey.getSurveyAttachments.mockClear();
    mockUseApi.survey.deleteSurveyAttachment.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('correctly opens and closes the file upload dialog', async () => {
    const mockSurveyContext: ISurveyContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });
    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const mockProjectContext: IProjectContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const { getByText, queryByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveyContext.Provider value={mockSurveyContext}>
                <SurveyAttachments />
              </SurveyContext.Provider>
            </ProjectContext.Provider>
          </ProjectAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );
    await waitFor(() => {
      expect(getByText('Upload')).toBeInTheDocument();
      expect(queryByText('Upload Attachments')).toBeNull();
    });

    fireEvent.click(getByText('Upload'));

    await waitFor(() => {
      expect(getByText('Upload Attachments')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Upload Attachments'));

    await waitFor(() => {
      expect(getByText('Close')).toBeInTheDocument();
    });
  });

  it('renders correctly with no attachments', async () => {
    const mockSurveyContext: ISurveyContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });
    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const mockProjectContext: IProjectContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveyContext.Provider value={mockSurveyContext}>
                <SurveyAttachments />
              </SurveyContext.Provider>
            </ProjectContext.Provider>
          </ProjectAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );
    await waitFor(() => {
      expect(getByText('No documents found')).toBeInTheDocument();
    });
  });

  it('renders correctly with attachments', async () => {
    const mockSurveyContext: ISurveyContext = {
      artifactDataLoader: {
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
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });
    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    mockUseApi.survey.getSurveyAttachments.mockResolvedValue({});

    const mockProjectContext: IProjectContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveyContext.Provider value={mockSurveyContext}>
                <SurveyAttachments />
              </SurveyContext.Provider>
            </ProjectContext.Provider>
          </ProjectAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('deletes an attachment from the attachments list as expected', async () => {
    mockUseApi.survey.deleteSurveyAttachment.mockResolvedValue(1);

    const mockSurveyContext: ISurveyContext = {
      artifactDataLoader: {
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
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });
    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const mockProjectContext: IProjectContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const { baseElement, queryByText, getByTestId, getAllByTestId, queryByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <DialogContextProvider>
              <ProjectContext.Provider value={mockProjectContext}>
                <SurveyContext.Provider value={mockSurveyContext}>
                  <SurveyAttachments />
                </SurveyContext.Provider>
              </ProjectContext.Provider>
            </DialogContextProvider>
          </ProjectAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
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

    mockSurveyContext.artifactDataLoader.data?.attachmentsList.splice(0, 1);

    await waitFor(() => {
      expect(queryByText('filename1.test')).not.toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockUseApi.survey.deleteSurveyAttachment.mockResolvedValue(1);

    const mockSurveyContext: ISurveyContext = {
      artifactDataLoader: {
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              fileType: AttachmentType.REPORT,
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });
    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const mockProjectContext: IProjectContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const { baseElement, queryByText, getByTestId, getAllByTestId, queryByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <DialogContextProvider>
              <ProjectContext.Provider value={mockProjectContext}>
                <SurveyContext.Provider value={mockSurveyContext}>
                  <SurveyAttachments />
                </SurveyContext.Provider>
              </ProjectContext.Provider>
            </DialogContextProvider>
          </ProjectAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockUseApi.survey.getSurveyAttachments.mockResolvedValue({
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
    mockUseApi.survey.deleteSurveyAttachment.mockResolvedValue(1);
    const mockSurveyContext: ISurveyContext = {
      artifactDataLoader: {
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              fileType: AttachmentType.REPORT,
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const mockProjectContext: IProjectContext = {
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });
    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const { baseElement, queryByText, getAllByTestId, queryByTestId, getAllByRole } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
            <DialogContextProvider>
              <ProjectContext.Provider value={mockProjectContext}>
                <SurveyContext.Provider value={mockSurveyContext}>
                  <SurveyAttachments />
                </SurveyContext.Provider>
              </ProjectContext.Provider>
            </DialogContextProvider>
          </ProjectAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockUseApi.survey.getSurveyAttachments.mockResolvedValue({
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
