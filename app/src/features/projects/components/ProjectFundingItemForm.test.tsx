import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import { IInvestmentActionCategoryOption } from './ProjectFundingForm';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from './ProjectFundingItemForm';

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
  },
  {
    value: 4,
    label: 'agency 4'
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

describe('ProjectFundingItemForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectFundingFormArrayItemInitialValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingItemForm
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with agency 1', () => {
    const existingFormValues: IProjectFundingFormArrayItem = {
      id: 1,
      agency_id: 1,
      investment_action_category: 1,
      investment_action_category_name: 'Some investment action',
      agency_project_id: '555',
      funding_amount: 666,
      start_date: '2021-03-14',
      end_date: '2021-04-14',
      revision_count: 2
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingItemForm
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with agency 2', () => {
    const existingFormValues: IProjectFundingFormArrayItem = {
      id: 1,
      agency_id: 2,
      investment_action_category: 2,
      investment_action_category_name: 'Some investment category',
      agency_project_id: '555',
      funding_amount: 666,
      start_date: '2021-03-14',
      end_date: '2021-04-14',
      revision_count: 2
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingItemForm
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with any agency other than 1 or 2', () => {
    const existingFormValues: IProjectFundingFormArrayItem = {
      id: 1,
      agency_id: 3,
      investment_action_category: 3,
      investment_action_category_name: 'Not Applicable',
      agency_project_id: '555',
      funding_amount: 666,
      start_date: '2021-03-14',
      end_date: '2021-04-14',
      revision_count: 2
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingItemForm
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe('auto selection of investment action category', () => {
    const component = (
      <Formik
        initialValues={ProjectFundingFormArrayItemInitialValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingItemForm
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    it('works if an agency_id with a matching NA investment action category is chosen', async () => {
      const { asFragment, getByText, getAllByRole, getByRole } = render(component);

      await waitFor(() => {
        expect(getByText('Agency Details')).toBeInTheDocument();
      });

      fireEvent.mouseDown(getAllByRole('button')[0]);
      const agencyNameListbox = within(getByRole('listbox'));
      fireEvent.click(agencyNameListbox.getByText(/agency 3/i));

      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });

    it('works if an agency_id with a non-matching investment action category is chosen', async () => {
      const { asFragment, getByText, getAllByRole, getByRole } = render(component);

      await waitFor(() => {
        expect(getByText('Agency Details')).toBeInTheDocument();
      });

      fireEvent.mouseDown(getAllByRole('button')[0]);
      const agencyNameListbox = within(getByRole('listbox'));
      fireEvent.click(agencyNameListbox.getByText(/agency 4/i));

      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});
