/**
 * Basic response object for an observation.
 */
export const observationIdResponseObject = {
  title: 'Observation Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number'
          }
        }
      }
    }
  }
};
