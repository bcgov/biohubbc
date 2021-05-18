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
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
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
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial default page correctly', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });

    const { getByText, getAllByText, asFragment } = renderContainer();

    await waitFor(() => {
      expect(getAllByText('Project Coordinator').length).toEqual(2);

      expect(getByText('Permits')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();

      expect(getByText('Objectives')).toBeVisible();

      expect(getByText('Locations')).toBeVisible();

      expect(getByText('Species')).toBeVisible();

      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();

      expect(getByText('Funding')).toBeVisible();

      expect(getByText('Partnerships')).toBeVisible();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('removes the extra project steps if all permits are marked as having not conducted sampling', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    const {
      findByText,
      asFragment,
      queryByText,
      getByText,
      getAllByText,
      getByTestId,
      getByLabelText
    } = renderContainer();

    // wait for initial page to load
    await waitFor(() => {
      expect(getAllByText('Project Coordinator').length).toEqual(2);

      expect(getByText('Permits')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();

      expect(getByText('Objectives')).toBeVisible();

      expect(getByText('Locations')).toBeVisible();

      expect(getByText('Species')).toBeVisible();

      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();

      expect(getByText('Funding')).toBeVisible();

      expect(getByText('Partnerships')).toBeVisible();
    });

    // populate coordinator form
    fireEvent.change(getByLabelText('First Name *'), { target: { value: 'first name' } });
    fireEvent.change(getByLabelText('Last Name *'), { target: { value: 'last name' } });
    fireEvent.change(getByLabelText('Business Email Address *'), { target: { value: 'email@email.com' } });

    const autocomplete = getByTestId('coordinator_agency');
    autocomplete.focus();

    // assign value to input field
    fireEvent.change(getByLabelText('Coordinator Agency *'), { target: { value: 'Rocha' } });

    await waitFor(() => {});

    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

    await waitFor(() => {});

    // select the first item
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    // go to next step
    fireEvent.click(getByText('Next'));

    // wait for permit form to load
    expect(await findByText('Add Permit')).toBeVisible();

    fireEvent.click(getByText('Add Permit'));

    // add a permit, but mark sampling conducted as false
    fireEvent.change(getByLabelText('Permit Number *'), { target: { value: 12345 } });
    fireEvent.change(getByTestId('sampling_conducted'), { target: { value: 'false' } });

    // wait for forms to load
    await waitFor(() => {
      expect(getByText('Project Coordinator')).toBeVisible();

      expect(getAllByText('Permits').length).toEqual(2);

      expect(queryByText('General Information')).toBeNull();

      expect(queryByText('Objectives')).toBeNull();

      expect(queryByText('Locations')).toBeNull();

      expect(queryByText('Species')).toBeNull();

      expect(queryByText('IUCN Conservation Actions Classification')).toBeNull();

      expect(queryByText('Funding')).toBeNull();

      expect(queryByText('Partnerships')).toBeNull();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the page title', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    const { findByText } = renderContainer();
    const PageTitle = await findByText('Create Project');

    expect(PageTitle).toBeVisible();
  });

  it('navigates to a different section on click of that section label', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    const { getByText, getAllByText, queryByLabelText } = renderContainer();

    // wait for initial page to load
    await waitFor(() => {
      expect(getAllByText('Project Coordinator').length).toEqual(2);

      expect(getByText('Permits')).toBeVisible();

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
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      history.push('/home');
      history.push('/projects/create');
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
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      history.push('/home');
      history.push('/projects/create');
      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(history.location.pathname).toEqual('/projects/create');
      fireEvent.click(AreYouSureYesButton);
      expect(history.location.pathname).toEqual('/projects');
    });

    it('does nothing if the user clicks `No`', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
      history.push('/home');
      history.push('/projects/create');
      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureNoButton = await rawFindByText(getByRole('dialog'), 'No', { exact: false });

      expect(history.location.pathname).toEqual('/projects/create');
      fireEvent.click(AreYouSureNoButton);
      expect(history.location.pathname).toEqual('/projects/create');
    });
  });

  describe('draft project', () => {
    beforeEach(() => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
      });
    });

    it('preloads draft data and populates on form fields', async () => {
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

      const { getByText, getAllByText, findByText, queryByText, getByLabelText } = renderContainer();

      // wait for initial page to load
      await waitFor(() => {
        expect(getAllByText('Project Coordinator').length).toEqual(2);
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
          permit: expect.any(Object),
          project: expect.any(Object),
          objectives: expect.any(Object),
          location: expect.any(Object),
          species: expect.any(Object),
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
        expect(mockBiohubApi().draft.updateDraft).toHaveBeenCalledWith(1, 'draft name', {
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
          species: expect.any(Object),
          iucn: expect.any(Object),
          funding: expect.any(Object),
          partnerships: expect.any(Object)
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
