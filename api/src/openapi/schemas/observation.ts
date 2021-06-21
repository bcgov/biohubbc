/**
 * Response object for observation update GET request
 */
export const observationUpdateGetResponseObject = {
  title: 'Observation get response object, for update purposes',
  type: 'object',
  properties: {}
};

/**
 * Basic post response object for an observation.
 */
export const observationPostResponseObject = {
  title: 'Observation Post Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};

/**
 * Basic get response object for an observation.
 */
export const observationGetResponseObject = {
  title: 'Observation Get Response Object',
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

/**
 * Request object for observation update PUT request
 */
export const observationUpdatePutRequestObject = {
  title: 'Observation Put Object',
  type: 'object',
  properties: {
    observation_data: {
      type: 'object'
    },
    revision_count: { type: 'number' }
  }
};
