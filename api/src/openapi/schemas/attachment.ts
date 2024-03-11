import { OpenAPIV3 } from 'openapi-types';

export const projectAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'attachment response object',
  type: 'object',
  additionalProperties: false,
  required: ['project_attachment_id', 'file_name', 'file_type', 'uuid', 'key', 'revision_count'],
  properties: {
    project_attachment_id: {
      description: 'Attachment id',
      type: 'number'
    },
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
    create_user: {
      description: 'The user who created the record.',
      type: 'integer',
      minimum: 1
    },
    create_date: {
      description: 'The date the record was created.',
      type: 'string'
    },
    update_user: {
      description: 'The user who last updated the record.',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    update_date: {
      description: 'The date the record was last updated.',
      type: 'string',
      nullable: true
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const surveyAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'attachment response object',
  type: 'object',
  additionalProperties: false,
  required: [
    'survey_attachment_id',
    'file_name',
    'file_type',
    'create_user',
    'create_date',
    'update_date',
    'file_size',
    'uuid',
    'key',
    'revision_count'
  ],
  properties: {
    survey_attachment_id: {
      description: 'Attachment id',
      type: 'number'
    },
    file_name: {
      description: 'Attachment file name',
      type: 'string'
    },
    file_type: {
      description: 'Attachment file type',
      type: 'string'
    },
    create_user: {
      description: 'Attachment create user',
      type: 'number'
    },
    create_date: {
      description: 'Attachment create date',
      type: 'string'
    },
    update_date: {
      description: 'Attachment update date',
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
      type: 'string',
      nullable: true
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
    revision_count: {
      description: 'Attachment revision count',
      type: 'number'
    }
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
    create_user: {
      description: 'The user who created the record.',
      type: 'integer',
      minimum: 1
    },
    create_date: {
      description: 'The date the record was created.',
      type: 'string'
    },
    update_user: {
      description: 'The user who last updated the record.',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    update_date: {
      description: 'The date the record was last updated.',
      type: 'string',
      nullable: true
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const surveyReportAttachmentSchema: OpenAPIV3.SchemaObject = {
  title: 'Report attachment response object',
  type: 'object',
  additionalProperties: false,
  required: [
    'survey_attachment_id',
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
    survey_attachment_id: {
      description: 'Report metadata attachment id',
      type: 'number'
    },
    uuid: {
      description: 'Report metadata attachment uuid',
      type: 'string'
    },
    file_name: {
      description: 'Report metadata attachment file name',
      type: 'string'
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
    file_size: {
      description: 'Report metadata attachment file size',
      type: 'string'
    },
    create_user: {
      description: 'The user who created the record.',
      type: 'integer',
      minimum: 1
    },
    create_date: {
      description: 'The date the record was created.',
      type: 'string'
    },
    update_user: {
      description: 'The user who last updated the record.',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    update_date: {
      description: 'The date the record was last updated.',
      type: 'string',
      nullable: true
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const projectReportAttachmentAuthorSchema: OpenAPIV3.SchemaObject = {
  title: 'Report attachment author response object',
  type: 'object',
  additionalProperties: false,
  required: ['project_report_author_id', 'project_report_attachment_id', 'first_name', 'last_name', 'revision_count'],
  properties: {
    project_report_author_id: {
      description: 'Report metadata author id',
      type: 'number'
    },
    project_report_attachment_id: {
      description: 'Report metadata attachment id',
      type: 'number'
    },
    first_name: {
      description: 'Report metadata author first name',
      type: 'string'
    },
    last_name: {
      description: 'Report metadata author last name',
      type: 'string'
    },
    create_user: {
      description: 'The user who created the record.',
      type: 'integer',
      minimum: 1
    },
    create_date: {
      description: 'The date the record was created.',
      type: 'string'
    },
    update_user: {
      description: 'The user who last updated the record.',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    update_date: {
      description: 'The date the record was last updated.',
      type: 'string',
      nullable: true
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};
