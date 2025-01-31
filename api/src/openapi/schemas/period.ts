import { OpenAPIV3 } from 'openapi-types';

/**
 * Schema for creating a single period record.
 *
 * Note: This does NOT account for the fact that in the schema survey_sample_site_id, method_technique_id, and
 * period start_date/end_date can be null, but not all 3 at the same time. At least one of these fields must be present.
 * OpenApi does not support this level of validation, so it is up to the API and DB  to enforce this.
 */
export const CreatePeriodRequestSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['method_technique_id', 'survey_sample_site_id', 'start_date', 'start_time', 'end_date', 'end_time'],
  additionalProperties: false,
  properties: {
    survey_sample_site_id: {
      type: 'integer',
      minimum: 1,
      description: 'Primary key of a sampling site.',
      nullable: true
    },
    method_technique_id: {
      type: 'integer',
      minimum: 1,
      description: 'Primary key of a method technique.',
      nullable: true
    },
    start_date: {
      type: 'string',
      description: 'Start date of the period',
      nullable: true
    },
    start_time: {
      type: 'string',
      description: 'Start time of the period',
      nullable: true
    },
    end_date: {
      type: 'string',
      description: 'End date of the period',
      nullable: true
    },
    end_time: {
      type: 'string',
      description: 'End time of the period',
      nullable: true
    }
  }
};

/**
 * Schema for a single period object.
 *
 * Note: This does NOT account for the fact that in the schema survey_sample_site_id, method_technique_id, and
 * period start_date/end_date can be null, but not all 3 at the same time. At least one of these fields must be present.
 * OpenApi does not support this level of validation, so it is up to the API and DB to enforce this.
 */
export const GetPeriodResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: [
    'survey_sample_period_id',
    'survey_id',
    'survey_sample_site_id',
    'method_technique_id',
    'start_date',
    'start_time',
    'end_date',
    'end_time',
    'method_technique',
    'survey_sample_site'
  ],
  additionalProperties: false,
  properties: {
    survey_sample_period_id: {
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      type: 'integer',
      minimum: 1
    },
    survey_sample_site_id: {
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    method_technique_id: {
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    start_date: {
      type: 'string',
      nullable: true
    },
    start_time: {
      type: 'string',
      nullable: true
    },
    end_date: {
      type: 'string',
      nullable: true
    },
    end_time: {
      type: 'string',
      nullable: true
    },
    survey_sample_site: {
      type: 'object',
      required: ['survey_sample_site_id', 'name'],
      additionalProperties: false,
      properties: {
        survey_sample_site_id: {
          type: 'integer',
          minimum: 1
        },
        name: {
          type: 'string'
        }
      },
      nullable: true
    },
    method_technique: {
      type: 'object',
      description: 'Details about the technique of the survey sample period',
      required: ['method_technique_id', 'name', 'description', 'method_response_metric_id'],
      properties: {
        method_technique_id: {
          type: 'integer',
          minimum: 1,
          description: 'Primary key of the method technique record'
        },
        name: {
          type: 'string',
          description: 'Name of the method technique'
        },
        description: {
          type: 'string',
          description: 'Description of the method technique',
          nullable: true
        },
        method_response_metric_id: {
          type: 'integer',
          minimum: 1
        }
      },
      nullable: true
    }
  }
};
