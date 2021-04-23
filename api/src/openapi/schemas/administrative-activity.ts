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
      type: 'string',
      description: 'The date this administrative activity was made'
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
