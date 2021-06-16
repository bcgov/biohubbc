/**
 * Basic response object for a survey.
 */
export const blockObservationIdResponseObject = {
  title: 'Block Observation Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
