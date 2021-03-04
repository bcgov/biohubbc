import { render } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectFundingForm, {
  IInvestmentActionCategoryOption,
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from './ProjectFundingForm';

const first_nations: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'nation 1'
  },
  {
    value: 2,
    label: 'nation 2'
  }
];

const stakeholder_partnerships: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'partner 1'
  },
  {
    value: 2,
    label: 'partner 2'
  }
];

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
            first_nations={first_nations}
            stakeholder_partnerships={stakeholder_partnerships}
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
      funding_agencies: [
        {
          agency_id: 1,
          investment_action_category: 1,
          agency_project_id: '111',
          funding_amount: 222,
          start_date: '2021-03-14',
          end_date: '2021-04-14'
        }
      ],
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 1']
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            first_nations={first_nations}
            stakeholder_partnerships={stakeholder_partnerships}
            funding_sources={funding_sources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
