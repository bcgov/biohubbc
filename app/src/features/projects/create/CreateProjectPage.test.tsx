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
import { Feature } from 'geojson';
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
    deleteDraft: jest.fn(),
    getDraft: jest.fn()
  },
  external: {
    post: jest.fn<Promise<{ features?: Feature[] }>, []>()
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

    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

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

      const { findByText, getByRole, findAllByText } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureTitle = await findByText('Cancel Project Creation');
      const AreYouSureText = await findByText('Are you sure you want to cancel?', { exact: false });
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

      const { findAllByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
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
      it('does not display delete draft button if not in draft', async () => {
        const { queryByText } = render(
          <MemoryRouter>
            <CreateProjectPage />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(queryByText('Delete Draft', { exact: false })).not.toBeInTheDocument();
        });
      });

      it('does display delete draft button if in draft', async () => {
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

        const { queryByText } = render(
          <MemoryRouter initialEntries={['?draftId=1']}>
            <CreateProjectPage />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(queryByText('Delete Draft', { exact: false })).toBeInTheDocument();
        });
      });

      it('dispalys a Delete draft Yes/No Dialog', async () => {
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

        const { getByText, findAllByText } = render(
          <MemoryRouter initialEntries={['?draftId=1']}>
            <CreateProjectPage />
          </MemoryRouter>
        );

        const deleteButton = await findAllByText('Delete Draft', { exact: false });

        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
          expect(getByText('Are you sure you want to delete this draft?', { exact: false })).toBeInTheDocument();
        });
      });

      it('closes dialog on No click', async () => {
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

        const { getByText, findAllByText, getByTestId, queryByText } = render(
          <MemoryRouter initialEntries={['?draftId=1']}>
            <CreateProjectPage />
          </MemoryRouter>
        );

        const deleteButton = await findAllByText('Delete Draft', { exact: false });

        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
          expect(getByText('Are you sure you want to delete this draft?')).toBeInTheDocument();
        });

        const NoButton = await getByTestId('no-button');
        fireEvent.click(NoButton);

        await waitFor(() => {
          expect(queryByText('Are you sure you want to delete this draft?')).not.toBeInTheDocument();
        });
      });

      it('deletes draft on Yes click', async () => {
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

        const { getByText, findAllByText, getByTestId } = render(
          <MemoryRouter initialEntries={['?draftId=1']}>
            <CreateProjectPage />
          </MemoryRouter>
        );

        const deleteButton = await findAllByText('Delete Draft', { exact: false });

        fireEvent.click(deleteButton[0]);

        await waitFor(() => {
          expect(getByText('Are you sure you want to delete this draft?')).toBeInTheDocument();
        });

        const YesButton = await getByTestId('yes-button');
        fireEvent.click(YesButton);

        await waitFor(() => {
          expect(mockBiohubApi().draft.deleteDraft).toBeCalled();
        });
      });
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
      const { getByLabelText, findAllByText } = renderContainer();

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
      });
    });

    it('closes the dialog on cancel button click', async () => {
      const { getByLabelText, findAllByText, getByRole, queryByLabelText } = renderContainer();

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[1]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
      });

      const cancelButton = rawGetByText(getByRole('dialog'), 'Cancel');

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions and closes the dialog on save button click', async () => {
      mockBiohubApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByText, findAllByText, queryByLabelText, getByLabelText } = renderContainer();

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockBiohubApi().draft.createDraft).toHaveBeenCalledWith('draft name', expect.any(Object));

        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(mockBiohubApi().draft.updateDraft).toHaveBeenCalledWith(1, 'draft name', expect.any(Object));

        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions with WIP form data', async () => {
      mockBiohubApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByText, findAllByText, getByLabelText, queryByLabelText } = renderContainer();

      // wait for initial page to load
      await waitFor(() => {
        expect(getByText('General Information')).toBeVisible();
      });

      // update first name field
      fireEvent.change(getByLabelText('First Name *'), { target: { value: 'draft first name' } });

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
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

        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });

      // update last name field
      fireEvent.change(getByLabelText('Last Name *'), { target: { value: 'draft last name' } });

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
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

        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });
    });

    it('renders an error dialog if the draft submit request fails', async () => {
      mockBiohubApi().draft.createDraft.mockImplementation(() => {
        throw new Error('Draft failed exception!');
      });

      const { getByText, findAllByText, getByLabelText, queryByLabelText } = renderContainer();

      const saveAsDraftButton = await findAllByText('Save Draft');

      fireEvent.click(saveAsDraftButton[0]);

      await waitFor(() => {
        expect(getByLabelText('Draft Name *')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(queryByLabelText('Draft Name *')).not.toBeInTheDocument();
      });
    });
  });
});
