/**
 * Response object for observation update GET request
 */
export const observationUpdateGetResponseObject = {
  title: 'Observation get response object, for update purposes',
  type: 'object',
  properties: {}
};

/**
 * Basic response object for an observation.
 */
export const observationResponseObject = {
  title: 'observation Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
