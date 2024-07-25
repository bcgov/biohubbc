import { OpenAPIV3 } from 'openapi-types';

/**
 * Shared file schema for all file formats.
 *
 * @see MIME types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 *
 */
export const fileSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Schema defining the structure of a file object uploaded and transformed via Multer middleware.',
  required: ['fieldname', 'originalname', 'mimetype', 'buffer'],
  properties: {
    fieldname: {
      description: 'Property name of incomming file upload. Multer expects `media`.',
      type: 'string',
      enum: ['media']
    },
    originalname: {
      description: 'Original name of the file with its extension as provided by the uploader.',
      type: 'string',
      example: 'import-file.txt'
    },
    encoding: {
      description: 'Encoding of the file content.',
      type: 'string',
      example: '7bit'
    },
    mimetype: {
      description: 'MIME type of the file, such as `text/csv` for CSV files.',
      type: 'string',
      example: 'text/csv'
    },
    buffer: {
      description: 'The content of the file transformed into a Buffer object for further processing.',
      type: 'object',
      format: 'buffer'
    },
    size: {
      description: 'Size of the file in kilobytes (KB). Minimum value is 1 KB.',
      type: 'integer',
      minimum: 1
    }
  }
};

/**
 * CSV file schema.
 *
 * Note: This could be extended further to have a regex that validates the `originalname` ends with `.csv`
 * but I think the enum value for `mimetype` is enough for our needs.
 *
 */
export const csvFileSchema: OpenAPIV3.SchemaObject = {
  ...fileSchema,
  properties: {
    ...fileSchema.properties,
    mimetype: {
      description: 'CSV File type.',
      type: 'string',
      enum: ['text/csv']
    }
  }
};
