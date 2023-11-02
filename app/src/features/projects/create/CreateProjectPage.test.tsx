import { AuthStateContext } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ProjectDetailsFormInitialValues } from 'features/projects/components/ProjectDetailsForm';
import { ProjectIUCNFormInitialValues } from 'features/projects/components/ProjectIUCNForm';
import { ProjectObjectivesFormInitialValues } from 'features/projects/components/ProjectObjectivesForm';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import { createMemoryHistory } from 'history';
import { GetRegionsResponse } from 'hooks/api/useSpatialApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IDraftResponse } from 'interfaces/useDraftApi.interface';
import { ICreateProjectResponse } from 'interfaces/useProjectApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { MemoryRouter, Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import {
  cleanup,
  findByText as rawFindByText,
  fireEvent,
  getByText as rawGetByText,
  render,
  waitFor
} from 'test-helpers/test-utils';
import { AddProjectParticipantsFormInitialValues } from '../participants/AddProjectParticipantsForm';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  draft: {
    createDraft: jest.fn<Promise<IDraftResponse>, []>(),
    updateDraft: jest.fn<Promise<IDraftResponse>, []>(),
    deleteDraft: jest.fn(),
    getDraft: jest.fn()
  },
  spatial: {
    getRegions: jest.fn<Promise<GetRegionsResponse>, []>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  project: {
    createProject: jest.fn<Promise<ICreateProjectResponse>, []>()
  },
  user: {
    searchSystemUser: jest.fn<Promise<ISystemUser[]>, []>()
  }
};

const mockCodesContext: ICodesContext = {
  codesDataLoader: {
    data: codes,
    load: () => {}
  } as DataLoader<any, any, any>
};

const authState = getMockAuthState({ base: SystemAdminAuthState });

const renderContainer = () => {
  return render(
    <AuthStateContext.Provider value={authState}>
      <CodesContext.Provider value={mockCodesContext}>
        <DialogContextProvider>
          <Router history={history}>
            <CreateProjectPage />,
          </Router>
        </DialogContextProvider>
      </CodesContext.Provider>
    </AuthStateContext.Provider>
  );
};

describe('CreateProjectPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.draft.createDraft.mockClear();
    mockUseApi.draft.updateDraft.mockClear();
    mockUseApi.draft.getDraft.mockClear();
    mockUseApi.spatial.getRegions.mockClear();
    mockUseApi.codes.getAllCodeSets.mockClear();
    mockUseApi.project.createProject.mockClear();
    mockUseApi.user.searchSystemUser.mockClear();

    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });

    mockUseApi.codes.getAllCodeSets.mockResolvedValue(codes);

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial default page correctly', async () => {
    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Create New Project')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();
    });
  });

  it('shows the page title', async () => {
    const { findByText } = renderContainer();
    const PageTitle = await findByText('Create New Project');

    expect(PageTitle).toBeVisible();
  });

  describe('Are you sure? Dialog', () => {
    it('shows warning dialog if the user clicks the `Cancel and Exit` button', async () => {
      history.push('/home');
      history.push('/admin/projects/create');

      const { findByText, getByRole, findAllByText } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureTitle = await findByText('Discard changes and exit?');
      const AreYouSureText = await findByText('Any changes you have made will not be saved. Do you want to proceed?', {
        exact: false
      });
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(AreYouSureTitle).toBeVisible();
      expect(AreYouSureText).toBeVisible();
      expect(AreYouSureYesButton).toBeVisible();
    });

    it('calls history.push() if the user clicks `Yes`', async () => {
      history.push('/home');
      history.push('/admin/projects/create');

      const { findAllByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(history.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureYesButton);
      expect(history.location.pathname).toEqual('/admin/projects');
    });

    it('does nothing if the user clicks `No`', async () => {
      history.push('/home');
      history.push('/admin/projects/create');

      const { findAllByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureNoButton = await rawFindByText(getByRole('dialog'), 'No');

      expect(history.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureNoButton);
      expect(history.location.pathname).toEqual('/admin/projects/create');
    });
  });

  describe('draft project', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('Delete Draft Button', () => {
      it('does display delete draft button if in draft', async () => {
        mockUseApi.draft.getDraft.mockResolvedValue({
          id: 1,
          name: 'My draft',
          data: {
            project: ProjectDetailsFormInitialValues.project,
            objectives: ProjectObjectivesFormInitialValues.objectives,
            iucn: ProjectIUCNFormInitialValues.iucn
          }
        });

        const { queryAllByText } = render(
          <AuthStateContext.Provider value={authState}>
            <CodesContext.Provider value={mockCodesContext}>
              <MemoryRouter initialEntries={['?draftId=1']}>
                <CreateProjectPage />
              </MemoryRouter>
            </CodesContext.Provider>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(queryAllByText('Delete Draft', { exact: false }).length).toEqual(2);
        });
      });

      it('displays a Delete draft Yes/No Dialog', async () => {
        mockUseApi.draft.getDraft.mockResolvedValue({
          id: 1,
          name: 'My draft',
          data: {
            project: ProjectDetailsFormInitialValues.project,
            objectives: ProjectObjectivesFormInitialValues.objectives,
            iucn: ProjectIUCNFormInitialValues.iucn
          }
        });

        const { getByText, findAllByText } = render(
          <AuthStateContext.Provider value={authState}>
            <CodesContext.Provider value={mockCodesContext}>
              <MemoryRouter initialEntries={['?draftId=1']}>
                <CreateProjectPage />
              </MemoryRouter>
            </CodesContext.Provider>
          </AuthStateContext.Provider>
        );

        const deleteButton = await findAllByText('Delete Draft', { exact: false });

        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
          expect(
            getByText('Are you sure you want to permanently delete this draft project? This action cannot be undone.', {
              exact: false
            })
          ).toBeInTheDocument();
        });
      });

      it('closes dialog on No click', async () => {
        mockUseApi.draft.getDraft.mockResolvedValue({
          id: 1,
          name: 'My draft',
          data: {
            project: ProjectDetailsFormInitialValues.project,
            objectives: ProjectObjectivesFormInitialValues.objectives,
            iucn: ProjectIUCNFormInitialValues.iucn
          }
        });

        const { getByText, findAllByText, getByTestId, queryByText } = render(
          <AuthStateContext.Provider value={authState}>
            <CodesContext.Provider value={mockCodesContext}>
              <MemoryRouter initialEntries={['?draftId=1']}>
                <CreateProjectPage />
              </MemoryRouter>
            </CodesContext.Provider>
          </AuthStateContext.Provider>
        );

        const deleteButton = await findAllByText('Delete Draft', { exact: false });

        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
          expect(
            getByText('Are you sure you want to permanently delete this draft project? This action cannot be undone.')
          ).toBeInTheDocument();
        });

        const NoButton = await getByTestId('no-button');
        fireEvent.click(NoButton);

        await waitFor(() => {
          expect(
            queryByText('Are you sure you want to permanently delete this draft project? This action cannot be undone.')
          ).not.toBeInTheDocument();
        });
      });

      it('deletes draft on Yes click', async () => {
        mockUseApi.draft.getDraft.mockResolvedValue({
          id: 1,
          name: 'My draft',
          data: {
            project: ProjectDetailsFormInitialValues.project,
            objectives: ProjectObjectivesFormInitialValues.objectives,
            iucn: ProjectIUCNFormInitialValues.iucn
          }
        });

        const { getByText, findAllByText, getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <CodesContext.Provider value={mockCodesContext}>
              <MemoryRouter initialEntries={['?draftId=1']}>
                <CreateProjectPage />
              </MemoryRouter>
            </CodesContext.Provider>
          </AuthStateContext.Provider>
        );

        const deleteButton = await findAllByText('Delete Draft', { exact: false });

        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
          expect(
            getByText('Are you sure you want to permanently delete this draft project? This action cannot be undone.')
          ).toBeInTheDocument();
        });

        const YesButton = await getByTestId('yes-button');
        fireEvent.click(YesButton);

        await waitFor(() => {
          expect(mockUseApi.draft.deleteDraft).toBeCalled();
        });
      });
    });

    it('preloads draft data and populates on form fields', async () => {
      mockUseApi.draft.getDraft.mockResolvedValue({
        id: 1,
        name: 'My draft',
        data: {
          project: {
            ...ProjectDetailsFormInitialValues.project,
            project_name: 'Test name'
          },
          objectives: ProjectObjectivesFormInitialValues.objectives,
          iucn: ProjectIUCNFormInitialValues.iucn
        }
      });

      const { getByDisplayValue } = render(
        <AuthStateContext.Provider value={authState}>
          <CodesContext.Provider value={mockCodesContext}>
            <MemoryRouter initialEntries={['?draftId=1']}>
              <CreateProjectPage />
            </MemoryRouter>
          </CodesContext.Provider>
        </AuthStateContext.Provider>
      );

      await waitFor(() => {
        expect(getByDisplayValue('Test name', { exact: false })).toBeInTheDocument();
      });
    });

    it('opens the save as draft and exit dialog', async () => {
      const { getByTestId, findAllByText } = renderContainer();

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });
    });

    it('closes the dialog on cancel button click', async () => {
      const { getByTestId, findAllByText, getByRole, queryByLabelText } = renderContainer();

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[1]);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });

      const cancelButton = rawGetByText(getByRole('dialog'), 'Cancel');

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft function and navigates to the projects list page', async () => {
      history.push('/admin/projects/create');

      mockUseApi.draft.createDraft.mockResolvedValue({
        webform_draft_id: 1,
        create_date: '2021-01-20',
        update_date: ''
      });

      const { getByTestId } = renderContainer();

      const saveDraftButton = await getByTestId('save-draft-button');

      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });

      fireEvent.change(getByTestId('draft_name'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save'));

      await waitFor(() => {
        expect(mockUseApi.draft.createDraft).toHaveBeenCalledWith('draft name', expect.any(Object));
        expect(history.location.pathname).toEqual('/admin/projects');
      });
    });

    it('calls the updateDraft function and navigates to the projects list page', async () => {
      history.push('/admin/projects/create?draftId=1');

      mockUseApi.draft.getDraft.mockResolvedValue({
        id: 1,
        name: 'My draft',
        data: {
          project: ProjectDetailsFormInitialValues.project,
          objectives: ProjectObjectivesFormInitialValues.objectives,
          iucn: ProjectIUCNFormInitialValues.iucn,
          participants: AddProjectParticipantsFormInitialValues.participants
        }
      });

      mockUseApi.draft.updateDraft.mockResolvedValue({
        webform_draft_id: 1,
        create_date: '2021-01-20',
        update_date: '2023-06-29'
      });

      const { getByText, getByTestId } = renderContainer();

      //wait for initial page to load
      await waitFor(() => {
        expect(getByText('General Information')).toBeVisible();
      });

      const saveDraftButton = await getByTestId('save-draft-button');

      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });

      fireEvent.change(getByTestId('draft_name'), { target: { value: 'my new draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save'));

      await waitFor(() => {
        expect(mockUseApi.draft.updateDraft).toHaveBeenCalledWith(1, 'my new draft name', expect.any(Object));

        expect(history.location.pathname).toEqual('/admin/projects');
      });
    });

    it('calls the createDraft functions with WIP form data and navigates to the projects list page', async () => {
      history.push('/admin/projects/create');

      mockUseApi.draft.createDraft.mockResolvedValue({
        webform_draft_id: 1,
        create_date: '2021-01-20',
        update_date: '2021-01-20'
      });

      const { getByText, getByTestId, getByLabelText } = renderContainer();

      //wait for initial page to load
      await waitFor(() => {
        expect(getByText('General Information')).toBeVisible();
      });

      // update project name and objectives
      fireEvent.change(getByLabelText('Project Name *'), { target: { value: 'draft project name' } });
      fireEvent.change(getByLabelText('Objectives *'), { target: { value: 'Draft objectives' } });

      const saveDraftButton = await getByTestId('save-draft-button');

      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });

      fireEvent.change(getByTestId('draft_name'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save'));

      await waitFor(() => {
        expect(mockUseApi.draft.createDraft).toHaveBeenCalledWith('draft name', {
          project: {
            project_name: 'draft project name',
            project_programs: [],
            start_date: '',
            end_date: ''
          },
          objectives: { objectives: 'Draft objectives' },
          iucn: { classificationDetails: [] },
          participants: [
            {
              agency: 'agency',
              display_name: 'admin-displayname',
              email: 'admin@email.com',
              identity_source: 'IDIR',
              project_role_names: ['Coordinator'],
              system_user_id: 1
            }
          ]
        });

        expect(history.location.pathname).toEqual('/admin/projects');
      });
    });

    it('calls the updateDraft functions with WIP form data and navigates to the projects list page', async () => {
      history.push('/admin/projects/create?draftId=1');

      mockUseApi.draft.getDraft.mockResolvedValue({
        id: 1,
        name: 'My draft',
        data: {
          project: ProjectDetailsFormInitialValues.project,
          objectives: ProjectObjectivesFormInitialValues.objectives,
          iucn: ProjectIUCNFormInitialValues.iucn,
          participants: AddProjectParticipantsFormInitialValues.participants
        }
      });

      mockUseApi.draft.updateDraft.mockResolvedValue({
        webform_draft_id: 1,
        create_date: '2021-01-20',
        update_date: '2021-01-20'
      });

      const { getByTestId, getByText, getByLabelText } = renderContainer();

      // wait for initial page to load
      await waitFor(() => {
        expect(getByText('General Information')).toBeVisible();
      });

      // update project objectives field
      fireEvent.change(getByLabelText('Objectives *'), { target: { value: 'my new Draft objectives' } });

      const saveDraftButton = await getByTestId('save-draft-button');

      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });

      fireEvent.change(getByTestId('draft_name'), { target: { value: 'my new draft project name' } });

      fireEvent.click(getByTestId('edit-dialog-save'));

      await waitFor(() => {
        expect(mockUseApi.draft.updateDraft).toHaveBeenCalledWith(1, 'my new draft project name', {
          project: {
            project_name: '',
            project_programs: [],
            start_date: '',
            end_date: ''
          },
          objectives: { objectives: 'my new Draft objectives' },
          iucn: { classificationDetails: [] },
          participants: [
            {
              displayName: '',
              email: '',
              identitySource: '',
              roleId: '',
              userIdentifier: ''
            }
          ]
        });

        expect(history.location.pathname).toEqual('/admin/projects');
      });
    });

    it('renders an error dialog if the draft submit request fails', async () => {
      mockUseApi.draft.createDraft.mockImplementation(() => {
        throw new Error('Draft failed exception!');
      });

      const { getByTestId, queryByLabelText } = renderContainer();

      const saveDraftButton = await getByTestId('save-draft-button');

      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(getByTestId('draft_name')).toBeVisible();
      });

      fireEvent.change(getByTestId('draft_name'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save'));

      await waitFor(() => {
        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });
    });
  });
});
