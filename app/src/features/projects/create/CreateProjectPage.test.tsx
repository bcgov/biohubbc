import {
  cleanup,
  findByText as rawFindByText,
  fireEvent,
  getByText as rawGetByText,
  render,
  waitFor
} from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ProjectDetailsFormInitialValues } from 'features/projects/components/ProjectDetailsForm';
import { ProjectFundingFormInitialValues } from 'features/projects/components/ProjectFundingForm';
import { ProjectIUCNFormInitialValues } from 'features/projects/components/ProjectIUCNForm';
import { ProjectLocationFormInitialValues } from 'features/projects/components/ProjectLocationForm';
import { ProjectObjectivesFormInitialValues } from 'features/projects/components/ProjectObjectivesForm';
import { ProjectPartnershipsFormInitialValues } from 'features/projects/components/ProjectPartnershipsForm';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  draft: {
    createDraft: jest.fn<Promise<object>, []>(),
    updateDraft: jest.fn<Promise<object>, []>(),
    getDraft: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <Router history={history}>
        <CreateProjectPage />,
      </Router>
    </DialogContextProvider>
  );
};

describe('CreateProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().codes.getAllCodeSets.mockClear();
    mockBiohubApi().draft.createDraft.mockClear();
    mockBiohubApi().draft.updateDraft.mockClear();
    mockBiohubApi().draft.getDraft.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial default page correctly', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    } as unknown) as IGetAllCodeSetsResponse);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Create Project')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();

      expect(getByText('Project Coordinator')).toBeVisible();

      expect(getByText('Funding and Partnerships')).toBeVisible();

      expect(getByText('Location and Boundary')).toBeVisible();
    });
  });

  it('shows the page title', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    } as unknown) as IGetAllCodeSetsResponse);

    const { findByText } = renderContainer();
    const PageTitle = await findByText('Create Project');

    expect(PageTitle).toBeVisible();
  });

  describe('Are you sure? Dialog', () => {
    it('shows warning dialog if the user clicks the `Cancel and Exit` button', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      } as unknown) as IGetAllCodeSetsResponse);

      history.push('/home');
      history.push('/admin/projects/create');

      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureTitle = await findByText('Cancel Create Project');
      const AreYouSureText = await findByText('Are you sure you want to cancel?');
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(AreYouSureTitle).toBeVisible();
      expect(AreYouSureText).toBeVisible();
      expect(AreYouSureYesButton).toBeVisible();
    });

    it('calls history.push() if the user clicks `Yes`', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      } as unknown) as IGetAllCodeSetsResponse);

      history.push('/home');
      history.push('/admin/projects/create');

      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(history.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureYesButton);
      expect(history.location.pathname).toEqual('/admin/projects');
    });

    it('does nothing if the user clicks `No`', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      } as unknown) as IGetAllCodeSetsResponse);

      history.push('/home');
      history.push('/admin/projects/create');

      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureNoButton = await rawFindByText(getByRole('dialog'), 'No', { exact: false });

      expect(history.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureNoButton);
      expect(history.location.pathname).toEqual('/admin/projects/create');
    });
  });

  describe('draft project', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('preloads draft data and populates on form fields', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      } as unknown) as IGetAllCodeSetsResponse);

      mockBiohubApi().draft.getDraft.mockResolvedValue({
        id: 1,
        name: 'My draft',
        data: {
          coordinator: {
            first_name: 'Draft first name',
            last_name: 'Draft last name',
            email_address: 'draftemail@example.com',
            coordinator_agency: '',
            share_contact_details: 'false'
          },
          project: ProjectDetailsFormInitialValues.project,
          objectives: ProjectObjectivesFormInitialValues.objectives,
          location: ProjectLocationFormInitialValues.location,
          iucn: ProjectIUCNFormInitialValues.iucn,
          funding: ProjectFundingFormInitialValues.funding,
          partnerships: ProjectPartnershipsFormInitialValues.partnerships
        }
      });

      const { getByDisplayValue } = render(
        <MemoryRouter initialEntries={['?draftId=1']}>
          <CreateProjectPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(getByDisplayValue('Draft first name', { exact: false })).toBeInTheDocument();
        expect(getByDisplayValue('Draft last name', { exact: false })).toBeInTheDocument();
        expect(getByDisplayValue('draftemail@example.com', { exact: false })).toBeInTheDocument();
      });
    });

    it('opens the save as draft and exit dialog', async () => {
      const { getByText, findByText } = renderContainer();

      const saveAsDraftButton = await findByText('Save as Draft and Exit');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });
    });

    it('closes the dialog on cancel button click', async () => {
      const { getByText, findByText, queryByText, getByRole } = renderContainer();

      const saveAsDraftButton = await findByText('Save as Draft and Exit');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      const cancelButton = rawGetByText(getByRole('dialog'), 'Cancel');

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions and closes the dialog on save button click', async () => {
      mockBiohubApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByText, findByText, queryByText, getByLabelText } = renderContainer();

      const saveAsDraftButton = await findByText('Save as Draft and Exit');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockBiohubApi().draft.createDraft).toHaveBeenCalledWith('draft name', expect.any(Object));

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });

      fireEvent.click(getByText('Save as Draft and Exit'));

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockBiohubApi().draft.updateDraft).toHaveBeenCalledWith(1, 'draft name', expect.any(Object));

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions with WIP form data', async () => {
      mockBiohubApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByText, findByText, queryByText, getByLabelText } = renderContainer();

      // wait for initial page to load
      await waitFor(() => {
        expect(getByText('General Information')).toBeVisible();
      });

      // update first name field
      fireEvent.change(getByLabelText('First Name *'), { target: { value: 'draft first name' } });

      const saveAsDraftButton = await findByText('Save as Draft and Exit');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockBiohubApi().draft.createDraft).toHaveBeenCalledWith('draft name', {
          coordinator: {
            first_name: 'draft first name',
            last_name: '',
            email_address: '',
            coordinator_agency: '',
            share_contact_details: 'false'
          },
          project: {
            project_name: '',
            project_type: ('' as unknown) as number,
            project_activities: [],
            start_date: '',
            end_date: ''
          },
          objectives: { objectives: '' },
          location: { location_description: '', geometry: [] },
          iucn: { classificationDetails: [] },
          funding: { funding_sources: [] },
          partnerships: { indigenous_partnerships: [], stakeholder_partnerships: [] }
        });

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });

      // update last name field
      fireEvent.change(getByLabelText('Last Name *'), { target: { value: 'draft last name' } });

      fireEvent.click(getByText('Save as Draft and Exit'));

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockBiohubApi().draft.updateDraft).toHaveBeenCalledWith(1, 'draft name', {
          coordinator: {
            first_name: 'draft first name',
            last_name: 'draft last name',
            email_address: '',
            coordinator_agency: '',
            share_contact_details: 'false'
          },
          project: {
            project_name: '',
            project_type: ('' as unknown) as number,
            project_activities: [],
            start_date: '',
            end_date: ''
          },
          objectives: { objectives: '' },
          location: { location_description: '', geometry: [] },
          iucn: { classificationDetails: [] },
          funding: { funding_sources: [] },
          partnerships: { indigenous_partnerships: [], stakeholder_partnerships: [] }
        });

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('renders an error dialog if the draft submit request fails', async () => {
      mockBiohubApi().draft.createDraft.mockImplementation(() => {
        throw new Error('Draft failed exception!');
      });

      const { getByText, findByText, queryByText, getByLabelText } = renderContainer();

      const saveAsDraftButton = await findByText('Save as Draft and Exit');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });
  });
});
