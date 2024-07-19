import { OpenAPIV3 } from 'openapi-types';

export const fileSchema: OpenAPIV3.SchemaObject = {
  properties: {
    fieldname: {
      description: 'Multer transformed field. Will default to `media`',
      type: 'string',
      example: 'media'
    },
    originalname: {
      description: 'Original name of file with extension.',
      type: 'string',
      example: 'import-file.txt'
    },
    encoding: {
      type: 'string'
    },
    mimetype: {
      description: 'File type.',
      type: 'string',
      example: 'text/csv'
    },
    buffer: {
      description: 'File transformed into Buffer.',
      type: 'object',
      format: 'buffer'
    },
    size: {
      description: 'Size of file in Kb.',
      type: 'integer',
      minimum: 1
    }
  }
};

export const csvFileSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['fieldname', 'originalname', 'mimetype', 'buffer'],
  properties: {
    ...fileSchema.properties,
    mimetype: {
      description: 'CSV File type.',
      type: 'string',
      enum: ['text/csv']
    }
  }
};
