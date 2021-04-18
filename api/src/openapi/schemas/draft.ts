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

/**
 * Response object for getting a draft
 */
export const draftGetResponseObject = {
  title: 'Draft Get Response Object',
  type: 'object',
  required: ['id', 'name', 'data'],
  properties: {
    id: {
      type: 'number'
    },
    name: {
      type: 'string',
      description: 'The name of the draft'
    },
    data: {
      type: 'string',
      description: 'The data associated with this draft'
    }
  }
};
