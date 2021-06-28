/**
 * Basic response object for a spatial search.
 */
export const searchResponseObject = {
  title: 'Search Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
