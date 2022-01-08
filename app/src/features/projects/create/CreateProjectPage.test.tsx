import {
  cleanup,
  findByText as rawFindByText,
  fireEvent,
  getByText as rawGetByText,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ProjectDetailsFormInitialValues } from 'features/projects/components/ProjectDetailsForm';
import { ProjectFundingFormInitialValues } from 'features/projects/components/ProjectFundingForm';
import { ProjectIUCNFormInitialValues } from 'features/projects/components/ProjectIUCNForm';
import { ProjectLocationFormInitialValues } from 'features/projects/components/ProjectLocationForm';
import { ProjectObjectivesFormInitialValues } from 'features/projects/components/ProjectObjectivesForm';
import { ProjectPartnershipsFormInitialValues } from 'features/projects/components/ProjectPartnershipsForm';
import { ProjectPermitFormInitialValues } from 'features/projects/components/ProjectPermitForm';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  },
  draft: {
    createDraft: jest.fn<Promise<object>, []>(),
    updateDraft: jest.fn<Promise<object>, []>(),
    getDraft: jest.fn()
  },
  permit: {
    getNonSamplingPermits: jest.fn<Promise<object>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

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
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
    mockRestorationTrackerApi().draft.createDraft.mockClear();
    mockRestorationTrackerApi().draft.updateDraft.mockClear();
    mockRestorationTrackerApi().draft.getDraft.mockClear();
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial default page correctly', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);

    const { getByText, getAllByText, asFragment } = renderContainer();

    await waitFor(() => {
      expect(getAllByText('Project Contact').length).toEqual(2);

      expect(getByText('Project Permits')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();

      expect(getByText('Objectives')).toBeVisible();

      expect(getByText('Locations')).toBeVisible();

      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();

      expect(getByText('Funding')).toBeVisible();

      expect(getByText('Partnerships')).toBeVisible();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the page title', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);

    const { findByText } = renderContainer();
    const PageTitle = await findByText('Create Project');

    expect(PageTitle).toBeVisible();
  });

  it('navigates to a different section on click of that section label', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);

    const { getByText, getAllByText, queryByLabelText } = renderContainer();

    // wait for initial page to load
    await waitFor(() => {
      expect(getAllByText('Project Contact').length).toEqual(2);

      expect(getByText('Project Permits')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();

      expect(queryByLabelText('Project Type')).toBeNull();
    });

    fireEvent.click(getByText('General Information'));

    await waitFor(() => {
      expect(getAllByText('General Information').length).toEqual(2);

      expect(queryByLabelText('Project Type')).toBeVisible();
    });
  });

  describe('Are you sure? Dialog', () => {
    it('shows warning dialog if the user clicks the `Cancel and Exit` button', async () => {
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
        { permit_id: 1, number: 1, type: 'Wildlife' }
      ]);

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
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
        { permit_id: 1, number: 1, type: 'Wildlife' }
      ]);

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
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
        { permit_id: 1, number: 1, type: 'Wildlife' }
      ]);

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
    beforeEach(() => {
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
        { permit_id: 1, number: 1, type: 'Wildlife' }
      ]);
    });

    it('preloads draft data and populates on form fields', async () => {
      mockRestorationTrackerApi().draft.getDraft.mockResolvedValue({
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
          permit: ProjectPermitFormInitialValues,
          project: ProjectDetailsFormInitialValues,
          objectives: ProjectObjectivesFormInitialValues,
          location: ProjectLocationFormInitialValues,
          iucn: ProjectIUCNFormInitialValues,
          funding: ProjectFundingFormInitialValues,
          partnerships: ProjectPartnershipsFormInitialValues
        }
      });

      render(
        <MemoryRouter initialEntries={['?draftId=1']}>
          <CreateProjectPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Draft first name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Draft last name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('draftemail@example.com')).toBeInTheDocument();
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
      mockRestorationTrackerApi().draft.createDraft.mockResolvedValue({
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
        expect(mockRestorationTrackerApi().draft.createDraft).toHaveBeenCalledWith('draft name', expect.any(Object));

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });

      fireEvent.click(getByText('Save as Draft and Exit'));

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockRestorationTrackerApi().draft.updateDraft).toHaveBeenCalledWith(1, 'draft name', expect.any(Object));

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions with WIP form data', async () => {
      mockRestorationTrackerApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByText, getAllByText, findByText, queryByText, getByLabelText } = renderContainer();

      // wait for initial page to load
      await waitFor(() => {
        expect(getAllByText('Project Contact').length).toEqual(2);
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
        expect(mockRestorationTrackerApi().draft.createDraft).toHaveBeenCalledWith('draft name', {
          coordinator: {
            first_name: 'draft first name',
            last_name: '',
            email_address: '',
            coordinator_agency: '',
            share_contact_details: 'false'
          },
          permit: expect.any(Object),
          project: expect.any(Object),
          objectives: expect.any(Object),
          location: expect.any(Object),
          iucn: expect.any(Object),
          funding: expect.any(Object),
          partnerships: expect.any(Object)
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
        expect(mockRestorationTrackerApi().draft.updateDraft).toHaveBeenCalledWith(1, 'draft name', {
          coordinator: {
            first_name: 'draft first name',
            last_name: 'draft last name',
            email_address: '',
            coordinator_agency: '',
            share_contact_details: 'false'
          },
          permit: expect.any(Object),
          project: expect.any(Object),
          objectives: expect.any(Object),
          location: expect.any(Object),
          iucn: expect.any(Object),
          funding: expect.any(Object),
          partnerships: expect.any(Object)
        });

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('renders an error dialog if the draft submit request fails', async () => {
      mockRestorationTrackerApi().draft.createDraft.mockImplementation(() => {
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
