import { render, fireEvent, act } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectFundingForm, {
  IInvestmentActionCategoryOption,
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from './ProjectFundingForm';
import { codes } from 'test-helpers/code-helpers';
import ProjectStepComponents from 'utils/ProjectStepComponents';

const funding_sources: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'agency 1'
  },
  {
    value: 2,
    label: 'agency 2'
  },
  {
    value: 3,
    label: 'agency 3'
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
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectFundingFormInitialValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing funding values', () => {
    const existingFormValues: IProjectFundingForm = {
      funding_sources: [
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
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectFunding" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('shows add funding source dialog on add click', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding_sources: [
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
        },
        {
          id: 13,
          agency_id: 3,
          investment_action_category: 3,
          investment_action_category_name: 'not applicable',
          agency_project_id: '113',
          funding_amount: 224,
          start_date: '2021-03-16',
          end_date: '2021-04-16',
          revision_count: 0
        }
      ]
    };

    const { asFragment, getByTestId, queryByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectFunding" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();

    const addButton = getByTestId('add-button');

    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    expect(await queryByText('Agency Details')).toBeInTheDocument();
  });

  it('shows edit funding source dialog on edit click', async () => {
    await act(async () => {
      const existingFormValues: IProjectFundingForm = {
        funding_sources: [
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
      };

      const { asFragment, getByTestId, getByText, queryByText } = render(
        <Formik
          initialValues={existingFormValues}
          validationSchema={ProjectFundingFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          {() => <ProjectStepComponents component="ProjectFunding" codes={codes} />}
        </Formik>
      );

      expect(asFragment()).toMatchSnapshot();

      const editButton = await getByTestId('edit-button-0');
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);

      expect(asFragment()).toMatchSnapshot();

      expect(await queryByText('Agency Details')).toBeInTheDocument();

      const cancelButton = await getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
      expect(await queryByText('Cancel')).not.toBeInTheDocument();

      fireEvent.click(editButton);
      const saveButton = await getByText('Save Changes');
      expect(saveButton).toBeInTheDocument();
      fireEvent.click(saveButton);

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('deletes funding source dialog on delete click', async () => {
    await act(async () => {
      const existingFormValues: IProjectFundingForm = {
        funding_sources: [
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
      };

      const { asFragment, getByTestId, queryByTestId } = render(
        <Formik
          initialValues={existingFormValues}
          validationSchema={ProjectFundingFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          {() => <ProjectStepComponents component="ProjectFunding" codes={codes} />}
        </Formik>
      );

      const deleteButton = await getByTestId('delete-button-0');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);

      expect(await queryByTestId('delete-button-0')).not.toBeInTheDocument();

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
