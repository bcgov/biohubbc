import { Formik } from 'formik';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import ProjectFundingForm, {
  IInvestmentActionCategoryOption,
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from './ProjectFundingForm';
import { FundingSourceType, IFundingSourceAutocompleteField } from './ProjectFundingItemForm';

const funding_sources: IFundingSourceAutocompleteField[] = [
  {
    value: 1,
    label: 'agency 1',
    type: FundingSourceType.FUNDING_SOURCE
  },
  {
    value: 2,
    label: 'agency 2',
    type: FundingSourceType.FUNDING_SOURCE
  },
  {
    value: 3,
    label: 'agency 3',
    type: FundingSourceType.FUNDING_SOURCE
  }
];

const first_nations: IFundingSourceAutocompleteField[] = [
  {
    value: 1,
    label: 'First Nation 1',
    type: FundingSourceType.FIRST_NATIONS
  },
  {
    value: 2,
    label: 'First Nation 2',
    type: FundingSourceType.FIRST_NATIONS
  },
  {
    value: 3,
    label: 'First Nation 3',
    type: FundingSourceType.FIRST_NATIONS
  }
];

const investment_action_category: IInvestmentActionCategoryOption[] = [
  {
    value: 1,
    fs_id: 1,
    label: 'action 1'
  },
  {
    value: 2,
    fs_id: 2,
    label: 'category 1'
  },
  {
    value: 3,
    fs_id: 3,
    label: 'not applicable'
  }
];

describe('ProjectFundingForm', () => {
  it('renders correctly with default empty values', async () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectFundingFormInitialValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            first_nations={first_nations}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    const addButton = getByTestId('funding-form-add-button');
    expect(addButton).toBeInTheDocument();
  });

  it('renders correctly with existing funding values', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            id: 11,
            agency_id: 1,
            investment_action_category: 1,
            investment_action_category_name: 'Action 23',
            agency_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            revision_count: 23
          }
        ]
      }
    };

    const { getByTestId } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            first_nations={first_nations}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    const addButton = getByTestId('funding-form-add-button');
    expect(addButton).toBeInTheDocument();
  });

  it('shows add funding source dialog on add click', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            id: 11,
            agency_id: 1,
            investment_action_category: 1,
            investment_action_category_name: 'action 1',
            agency_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            revision_count: 23
          },
          {
            id: 12,
            agency_id: 2,
            investment_action_category: 2,
            investment_action_category_name: 'category 1',
            agency_project_id: '112',
            funding_amount: 223,
            start_date: '2021-03-15',
            end_date: '2021-04-15',
            revision_count: 24
          }
        ]
      }
    };

    const { getByTestId, findByTestId } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            first_nations={first_nations}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    const addButton = getByTestId('funding-form-add-button');
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    const editDialog = await findByTestId('edit-dialog');
    expect(editDialog).toBeInTheDocument();
  });

  it('shows edit funding source dialog on edit click', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            id: 11,
            agency_id: 1,
            investment_action_category: 1,
            investment_action_category_name: 'action 1',
            agency_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            revision_count: 23
          }
        ]
      }
    };

    const { getByTestId, findByTestId, queryByTestId } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            first_nations={first_nations}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    const editButton = getByTestId('funding-form-edit-button-0');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    const saveButton = getByTestId('edit-dialog-cancel');
    expect(saveButton).toBeInTheDocument();

    const editDialog = await findByTestId('edit-dialog');
    expect(editDialog).toBeInTheDocument();

    const cancelButton = getByTestId('edit-dialog-cancel');
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);

    let editDialog2;
    await waitFor(() => {
      editDialog2 = queryByTestId('edit-dialog');
    });
    expect(editDialog2).not.toBeInTheDocument();
  });

  it('deletes funding source dialog on delete click', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            id: 11,
            agency_id: 1,
            investment_action_category: 1,
            investment_action_category_name: 'action 1',
            agency_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            revision_count: 23
          }
        ]
      }
    };

    const { getByTestId, queryByTestId } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            first_nations={first_nations}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    const deleteButton = getByTestId('funding-form-delete-button-0');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    let deleteButton2;
    await waitFor(() => {
      deleteButton2 = queryByTestId('funding-form-delete-button-0');
    });
    expect(deleteButton2).not.toBeInTheDocument();
  });
});
