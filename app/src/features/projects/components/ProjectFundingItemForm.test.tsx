import { render } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import React from 'react';
import { IInvestmentActionCategoryOption } from './ProjectFundingForm';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues
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
    const { baseElement } = render(
      <div id="root">
        <ProjectFundingItemForm
          open={true}
          onClose={() => {}}
          onCancel={() => {}}
          onSubmit={() => {}}
          initialValues={ProjectFundingFormArrayItemInitialValues}
          funding_sources={funding_sources}
          investment_action_category={investment_action_category}
        />
      </div>
    );

    expect(baseElement).toMatchSnapshot();
  });

  describe('renders correctly with existing funding item values', () => {
    it('with agency_id 1', () => {
      const existingFormValues: IProjectFundingFormArrayItem = {
        agency_id: 1,
        investment_action_category: 1,
        agency_project_id: '111',
        funding_amount: 222,
        start_date: '2021-03-14',
        end_date: '2021-04-14'
      };

      const { baseElement } = render(
        <div id="root">
          <ProjectFundingItemForm
            open={true}
            onClose={() => {}}
            onCancel={() => {}}
            onSubmit={() => {}}
            initialValues={existingFormValues}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        </div>
      );

      expect(baseElement).toMatchSnapshot();
    });

    it('with agency_id 2', () => {
      const existingFormValues: IProjectFundingFormArrayItem = {
        agency_id: 2,
        investment_action_category: 2,
        agency_project_id: '333',
        funding_amount: 444,
        start_date: '2021-03-14',
        end_date: '2021-04-14'
      };

      const { baseElement } = render(
        <div id="root">
          <ProjectFundingItemForm
            open={true}
            onClose={() => {}}
            onCancel={() => {}}
            onSubmit={() => {}}
            initialValues={existingFormValues}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        </div>
      );

      expect(baseElement).toMatchSnapshot();
    });

    it('with agency_id other than 1 or 2', () => {
      const existingFormValues: IProjectFundingFormArrayItem = {
        agency_id: 3,
        investment_action_category: 3,
        agency_project_id: '555',
        funding_amount: 666,
        start_date: '2021-03-14',
        end_date: '2021-04-14'
      };

      const { baseElement } = render(
        <div id="root">
          <ProjectFundingItemForm
            open={true}
            onClose={() => {}}
            onCancel={() => {}}
            onSubmit={() => {}}
            initialValues={existingFormValues}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        </div>
      );

      expect(baseElement).toMatchSnapshot();
    });
  });
});
