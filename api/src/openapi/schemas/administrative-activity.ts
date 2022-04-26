/**
 * Response object for creating an access request
 */
export const administrativeActivityResponseObject = {
  title: 'Administrative Activity Response Object',
  type: 'object',
  required: ['id', 'date'],
  properties: {
    id: {
      type: 'number'
    },
    date: {
      description: 'The date this administrative activity was made',
      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }]
    }
  }
};

/**
 * Response object for GET 'has pending administrative activities' operation
 */
export const hasPendingAdministrativeActivitiesResponseObject = {
  title: '`Has Pending Administrative Activities` Response Object',
  type: 'number'
};
