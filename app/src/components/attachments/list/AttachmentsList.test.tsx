import { AuthStateContext } from 'contexts/authStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { createMemoryHistory } from 'history';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { AttachmentType } from '../../../constants/attachments';
import AttachmentsList from './AttachmentsList';

jest.mock('../../../hooks/useBioHubApi');

describe('AttachmentsList', () => {
  afterEach(() => {
    cleanup();
  });

  const attachmentsList: IGetSurveyAttachment[] = [
    {
      id: 1,
      fileName: 'filename.test',
      fileType: AttachmentType.OTHER,
      lastModified: '2021-04-09 11:53:53',
      size: 3028,
      revisionCount: 1,
      supplementaryAttachmentData: null
    },
    {
      id: 20,
      fileName: 'filename20.test',
      fileType: AttachmentType.REPORT,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000,
      revisionCount: 1,
      supplementaryAttachmentData: null
    },
    {
      id: 30,
      fileName: 'filename30.test',
      fileType: AttachmentType.OTHER,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000000,
      revisionCount: 1,
      supplementaryAttachmentData: null
    }
  ];
  const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

  it('renders correctly with no Documents', () => {
    const mockSurveyContext: ISurveyContext = {
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const mockProjectContext: IProjectContext = {
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveyContext.Provider value={mockSurveyContext}>
              <AttachmentsList
                attachments={[]}
                handleDownload={jest.fn()}
                handleDelete={jest.fn()}
                handleViewDetails={jest.fn()}
                handleRemoveOrResubmit={jest.fn()}
              />
            </SurveyContext.Provider>
          </ProjectContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('No Documents')).toBeInTheDocument();
  });

  it('renders correctly with no shared files', () => {
    const mockSurveyContext: ISurveyContext = {
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const mockProjectContext: IProjectContext = {
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveyContext.Provider value={mockSurveyContext}>
              <AttachmentsList
                attachments={[]}
                handleDownload={jest.fn()}
                handleDelete={jest.fn()}
                handleViewDetails={jest.fn()}
                handleRemoveOrResubmit={jest.fn()}
                emptyStateText="No Shared Files"
              />
            </SurveyContext.Provider>
          </ProjectContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('No Shared Files')).toBeInTheDocument();
  });

  it('renders correctly with attachments (of various sizes)', async () => {
    const mockSurveyContext: ISurveyContext = {
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const mockProjectContext: IProjectContext = {
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveyContext.Provider value={mockSurveyContext}>
              <AttachmentsList
                attachments={attachmentsList}
                handleDownload={jest.fn()}
                handleDelete={jest.fn()}
                handleViewDetails={jest.fn()}
                handleRemoveOrResubmit={jest.fn()}
              />
            </SurveyContext.Provider>
          </ProjectContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename20.test')).toBeInTheDocument();
    expect(getByText('filename30.test')).toBeInTheDocument();
  });

  it('viewing file contents in new tab works as expected for project attachments', async () => {
    window.open = jest.fn();

    const mockSurveyContext: ISurveyContext = {
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const mockProjectContext: IProjectContext = {
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    const handleDownload = jest.fn();

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveyContext.Provider value={mockSurveyContext}>
              <AttachmentsList
                attachments={attachmentsList}
                handleDownload={handleDownload}
                handleDelete={jest.fn()}
                handleViewDetails={jest.fn()}
                handleRemoveOrResubmit={jest.fn()}
              />
            </SurveyContext.Provider>
          </ProjectContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(handleDownload).toHaveBeenCalledTimes(1);
    });
  });

  it('viewing file contents in new tab works as expected for survey attachments', async () => {
    const mockSurveyContext: ISurveyContext = {
      projectId: 1,
      surveyDataLoader: {
        data: { surveyData: { survey_details: { survey_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as ISurveyContext;

    const mockProjectContext: IProjectContext = {
      projectId: 1,
      projectDataLoader: {
        data: { projectData: { project: { project_name: 'name' } } },
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>
    } as unknown as IProjectContext;

    window.open = jest.fn();

    const handleDownload = jest.fn();

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <ProjectContext.Provider value={mockProjectContext}>
            <SurveyContext.Provider value={mockSurveyContext}>
              <AttachmentsList
                attachments={attachmentsList}
                handleDownload={handleDownload}
                handleDelete={jest.fn()}
                handleViewDetails={jest.fn()}
                handleRemoveOrResubmit={jest.fn()}
              />
            </SurveyContext.Provider>
          </ProjectContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(handleDownload).toHaveBeenCalledTimes(1);
    });
  });
});
