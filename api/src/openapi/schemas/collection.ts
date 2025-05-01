export const collectionCreatePostRequestObject = {
  title: 'Collection post request object',
  type: 'object',
  required: ['name', 'objectives'],
  properties: {
    name: { type: 'string' },
    objectives: { type: 'string' }
  }
};

export const collectionUpdatePutRequestObject = {
  title: 'Collection put request object',
  type: 'object',
  properties: {
    name: { type: 'string' },
    objectives: { type: 'string' }
  }
};

export const collectionResponseObject = {
  title: 'Collection response object',
  type: 'object',
  properties: {
    collection_id: { type: 'integer' },
    name: { type: 'string' },
    objectives: { type: 'string' }
  }
};