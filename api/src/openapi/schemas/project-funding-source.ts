/**
 * Request Object for project funding source POST request
 */
export const projectFundingSourcePostRequestObject = {
  title: 'Project funding source post request object',
  type: 'object',
  required: ['agency_id', 'investment_action_category', 'funding_amount', 'start_date', 'end_date'],
  properties: {
    agency_id: {
      type: 'number'
    },
    investment_action_category: {
      type: 'number'
    },
    agency_project_id: {
      type: 'string'
    },
    funding_amount: {
      type: 'number'
    },
    start_date: {
      type: 'string',
      description: 'ISO 8601 date string'
    },
    end_date: {
      type: 'string',
      description: 'ISO 8601 date string'
    }
  }
};
