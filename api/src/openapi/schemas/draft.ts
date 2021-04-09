/**
 * Response object for creating/updating a draft
 */
export const draftResponseObject = {
  title: 'Draft Response Object',
  type: 'object',
  required: ['id', 'date'],
  properties: {
    id: {
      type: 'number'
    },
    date: {
      type: 'string',
      description: 'The date this draft was last updated or created'
    }
  }
};
