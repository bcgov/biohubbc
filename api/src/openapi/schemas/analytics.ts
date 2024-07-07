import { OpenAPIV3 } from 'openapi-types';

export const getObservationAnalyticsSchema: OpenAPIV3.SchemaObject = {
  title: 'Observation analytics response object',
  type: 'array',
  items: {
    type: 'object',
    required: ['row_count', 'individual_count', 'individual_percentage'],
    // Additional properties is intentionally true to allow for dynamic key-value measurement pairs
    additionalProperties: true,
    properties: {
      row_count: {
        type: 'number',
        description: 'Number of rows in the group'
      },
      individual_count: {
        type: 'number',
        description: 'Sum of subcount values across all rows in the group'
      },
      individual_percentage: {
        type: 'number',
        description:
          'Sum of subcount values across the group divided by the sum of subcount values across all observations in the specified surveys'
      }
    }
  }
};
