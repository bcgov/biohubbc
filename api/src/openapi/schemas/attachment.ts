import { OpenAPIV3 } from 'openapi-types';
import { updateCreateUserPropertiesSchema } from './user';

const attachmentProps: OpenAPIV3.SchemaObject = {
  properties: {
    file_name: {
      description: 'Attachment file name',
      type: 'string'
    },
    file_type: {
      description: 'Attachment file type',
      type: 'string'
    },
    file_size: {
      description: 'Attachment file size',
      type: 'string'
    },
    uuid: {
      description: 'Attachment uuid',
      type: 'string'
    },
    title: {
      description: 'Attachment title',
      type: 'string'
    },
    description: {
      description: 'Attachment description',
      type: 'string',
      nullable: true
    },
    key: {
      description: 'Attachment key',
      type: 'string'
    },
    ...updateCreateUserPropertiesSchema.properties
  }
};

export const projectAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'attachment response object',
  type: 'object',
  additionalProperties: false,
  required: ['project_attachment_id', 'file_name', 'file_type', 'uuid', 'key'],
  properties: {
    project_attachment_id: {
      description: 'Attachment id',
      type: 'number'
    },
    ...attachmentProps.properties
  }
};

export const surveyAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'attachment response object',
  type: 'object',
  additionalProperties: false,
  required: ['survey_attachment_id', 'file_name', 'file_type', 'file_size', 'uuid', 'key'],
  properties: {
    survey_attachment_id: {
      description: 'Attachment id',
      type: 'number'
    },
    ...attachmentProps.properties
  }
};

const reportAttachmentProperties: OpenAPIV3.SchemaObject = {
  properties: {
    uuid: {
      description: 'Report metadata attachment uuid',
      type: 'string'
    },
    file_name: {
      description: 'Report metadata attachment file name',
      type: 'string'
    },
    file_size: {
      description: 'Report metadata attachment file size',
      type: 'number',
      nullable: true
    },
    title: {
      description: 'Report metadata attachment title ',
      type: 'string'
    },
    description: {
      description: 'Report metadata attachment description',
      type: 'string'
    },
    year_published: {
      description: 'Report metadata attachment year published',
      type: 'number'
    },
    last_modified: {
      description: 'Report metadata last modified',
      type: 'string'
    },
    key: {
      description: 'Report metadata attachment key',
      type: 'string'
    },
    ...updateCreateUserPropertiesSchema.properties
  }
};

export const projectReportAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'Report attachment response object',
  type: 'object',
  additionalProperties: false,
  required: [
    'project_report_attachment_id',
    'uuid',
    'file_name',
    'file_size',
    'title',
    'description',
    'year_published',
    'last_modified',
    'key'
  ],
  properties: {
    project_report_attachment_id: {
      description: 'Report metadata attachment id',
      type: 'number'
    },
    ...reportAttachmentProperties.properties
  }
};

export const surveyReportAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'Report attachment response object',
  type: 'object',
  additionalProperties: false,
  required: [
    'survey_report_attachment_id',
    'uuid',
    'file_name',
    'title',
    'description',
    'year_published',
    'last_modified',
    'key',
    'file_size'
  ],
  properties: {
    survey_report_attachment_id: {
      description: 'Report metadata attachment id',
      type: 'number'
    },
    ...reportAttachmentProperties.properties
  }
};

export const projectReportAttachmentAuthorSchema: OpenAPIV3.SchemaObject = {
  title: 'Report attachment author response object',
  type: 'object',
  additionalProperties: false,
  required: ['first_name', 'last_name'],
  properties: {
    project_report_author_id: {
      description: 'Report metadata author id',
      type: 'number',
      nullable: true
    },
    project_report_attachment_id: {
      description: 'Report metadata attachment id',
      type: 'number',
      nullable: true
    },
    first_name: {
      description: 'Report metadata author first name',
      type: 'string'
    },
    last_name: {
      description: 'Report metadata author last name',
      type: 'string'
    },
    ...updateCreateUserPropertiesSchema.properties
  }
};

export const surveyReportAttachmentAuthorSchema: OpenAPIV3.SchemaObject = {
  title: 'Report attachment author response object',
  type: 'object',
  additionalProperties: false,
  required: ['first_name', 'last_name'],
  properties: {
    survey_report_author_id: {
      description: 'Report metadata author id',
      type: 'number',
      nullable: true
    },
    survey_report_attachment_id: {
      description: 'Report metadata attachment id',
      type: 'number',
      nullable: true
    },
    first_name: {
      description: 'Report metadata author first name',
      type: 'string'
    },
    last_name: {
      description: 'Report metadata author last name',
      type: 'string'
    },
    ...updateCreateUserPropertiesSchema.properties
  }
};
