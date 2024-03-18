import { OpenAPIV3 } from 'openapi-types';

/**
 * API schema used to assert pagination query paramaters
 * for paginated data requests.
 */
export const paginationRequestQueryParamSchema: OpenAPIV3.ParameterObject[] = [
  {
    in: 'query',
    name: 'page',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      description: 'The current page number to be fetched'
    }
  },
  {
    in: 'query',
    name: 'limit',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      description: 'The number of records to show per page'
    }
  },
  {
    in: 'query',
    name: 'sort',
    required: false,
    description: `The column to be sorted on, e.g. 'name'`,
    schema: {
      type: 'string'
    }
  },
  {
    in: 'query',
    name: 'order',
    required: false,
    description: 'The order of the sort, i.e. asc or desc',
    schema: {
      type: 'string',
      enum: ['asc', 'desc']
    }
  }
];

/**
 * API schema to assert pagination information for paginated data
 * responses.
 */
export const paginationResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['total', 'current_page', 'last_page'],
  properties: {
    total: {
      type: 'integer',
      description: 'The total number of records belonging to the collection'
    },
    per_page: {
      type: 'integer',
      minimum: 0,
      description: 'The number of records shown per page'
    },
    current_page: {
      type: 'integer',
      description: 'The current page being fetched'
    },
    last_page: {
      type: 'integer',
      minimum: 1,
      description: 'The total number of pages'
    },
    sort: {
      type: 'string',
      description: 'The column that is being sorted on'
    },
    order: {
      type: 'string',
      enum: ['asc', 'desc'],
      description: 'The sort order of the response'
    }
  },
  additionalProperties: false
};
