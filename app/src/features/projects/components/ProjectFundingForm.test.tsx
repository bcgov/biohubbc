import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
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
    const { queryByText } = render(
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

    await waitFor(() => {
      expect(queryByText('Add Funding Source')).toBeInTheDocument();
    });
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

    const { queryByText } = render(
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

    await waitFor(() => {
      expect(queryByText('Add Funding Source')).toBeInTheDocument();
      expect(queryByText('111')).toBeInTheDocument();
    });
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

    const { getByTestId, queryByText } = render(
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

    const addButton = getByTestId('add-button');

    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(queryByText('Agency Details')).toBeInTheDocument();
    });
  });

  it('shows edit funding source dialog on edit click', async () => {
    await act(async () => {
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

      const { getByTestId, getByText, queryByText } = render(
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

      const editButton = await getByTestId('edit-button-0');
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);

      expect(await queryByText('Agency Details')).toBeInTheDocument();

      const cancelButton = await getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
      expect(await queryByText('Cancel')).not.toBeInTheDocument();

      fireEvent.click(editButton);
      const saveButton = await getByText('Save Changes');
      expect(saveButton).toBeInTheDocument();
      fireEvent.click(saveButton);
    });
  });

  it('deletes funding source dialog on delete click', async () => {
    await act(async () => {
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

      const deleteButton = await getByTestId('delete-button-0');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);

      expect(await queryByTestId('delete-button-0')).not.toBeInTheDocument();
    });
  });
});
