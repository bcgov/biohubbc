import { OpenAPIV3 } from 'openapi-types';
import { updateCreateUserPropertiesSchema } from './user';

export const surveyDetailsSchema: OpenAPIV3.SchemaObject = {
  title: 'survey response object',
  type: 'object',
  additionalProperties: false,
  required: ['survey_name', 'start_date', 'survey_types', 'progress_id'],
  properties: {
    id: {
      description: 'Survey id',
      type: 'integer',
      minimum: 1
    },
    project_id: {
      description: 'Project id',
      type: 'integer',
      minimum: 1
    },
    uuid: {
      description: 'Survey uuid',
      type: 'string',
      format: 'uuid',
      nullable: true
    },
    survey_name: {
      description: 'Survey name',
      type: 'string'
    },
    start_date: {
      type: 'string',
      description: 'Survey start date. ISO 8601 date string.'
    },
    end_date: {
      description: 'Survey end date',
      type: 'string',
      nullable: true
    },
    progress_id: {
      type: 'integer'
    },
    survey_types: {
      description: 'Survey types',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const SurveyCollectionUnitsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['critterbase_collection_category_id', 'critterbase_collection_unit_id'],
    properties: {
      critterbase_collection_category_id: {
        type: 'string',
        format: 'uuid'
      },
      critterbase_collection_unit_id: {
        type: 'string',
        format: 'uuid'
      }
    }
  }
};

export const surveyFundingSourceSchema: OpenAPIV3.SchemaObject = {
  title: 'survey funding source response object',
  type: 'object',
  additionalProperties: false,
  required: ['survey_funding_source_id', 'survey_id', 'funding_source_id', 'amount'],
  properties: {
    survey_funding_source_id: {
      description: 'Survey funding source id',
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer',
      minimum: 1
    },
    funding_source_id: {
      description: 'Funding source id',
      type: 'integer',
      minimum: 1
    },
    amount: {
      description: 'Funding source amount',
      type: 'number',
      minimum: 0
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    },
    funding_source_name: {
      description: 'Funding source name',
      type: 'string'
    },
    start_date: {
      description: 'Funding source start date',
      type: 'string',
      nullable: true
    },
    end_date: {
      description: 'Funding source end date',
      type: 'string',
      nullable: true
    },
    description: {
      description: 'Funding source description',
      type: 'string',
      nullable: true
    }
  }
};

export const focalSpeciesSchema: OpenAPIV3.SchemaObject = {
  title: 'focal species response object',
  type: 'object',
  additionalProperties: false,
  required: ['tsn', 'commonNames', 'scientificName', 'ecological_units'],
  properties: {
    tsn: {
      description: 'Taxonomy tsn',
      type: 'number'
    },
    commonNames: {
      description: 'Taxonomy common names',
      type: 'array',
      items: {
        type: 'string'
      },
      nullable: true
    },
    scientificName: {
      description: 'Taxonomy scientific name',
      type: 'string'
    },
    rank: {
      description: 'Taxonomy rank name',
      type: 'string'
    },
    kingdom: {
      description: 'Taxonomy kingdom name',
      type: 'string'
    },
    ecological_units: SurveyCollectionUnitsSchema
  }
};

export const surveySpeciesSchema: OpenAPIV3.SchemaObject = {
  description: 'Survey Species',
  type: 'object',
  additionalProperties: false,
  required: ['focal_species'],
  properties: {
    focal_species: {
      type: 'array',
      items: focalSpeciesSchema
    }
  }
};

export const surveyPermitSchema: OpenAPIV3.SchemaObject = {
  title: 'permit response object',
  type: 'object',
  additionalProperties: false,
  required: ['permits'],
  properties: {
    permits: {
      description: 'Permits',
      type: 'array',
      required: ['permit_id', 'permit_number', 'permit_type'],
      items: {
        type: 'object',
        properties: {
          permit_id: {
            description: 'Permit id',
            type: 'integer',
            nullable: true
          },
          permit_number: {
            description: 'Permit number',
            type: 'string'
          },
          permit_type: {
            description: 'Permit type',
            type: 'string'
          }
        }
      }
    }
  }
};

export const surveyFundingSourceDataSchema: OpenAPIV3.SchemaObject = {
  title: 'survey funding source response object',
  type: 'object',
  additionalProperties: false,
  required: ['funding_source_id', 'amount'],
  properties: {
    survey_funding_source_id: {
      description: 'Survey funding source id',
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer',
      nullable: true
    },
    funding_source_id: {
      description: 'Funding source id',
      type: 'integer',
      minimum: 1
    },
    amount: {
      description: 'Funding source amount',
      type: 'number',
      minimum: 0
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    },
    funding_source_name: {
      description: 'Funding source name',
      type: 'string'
    },
    start_date: {
      description: 'Funding source start date',
      type: 'string',
      nullable: true
    },
    end_date: {
      description: 'Funding source end date',
      type: 'string',
      nullable: true
    },
    description: {
      description: 'Funding source description',
      type: 'string',
      nullable: true
    }
  }
};

export const surveyPurposeAndMethodologySchema: OpenAPIV3.SchemaObject = {
  title: 'survey purpose and methodology response object',
  type: 'object',
  additionalProperties: false,
  required: ['intended_outcome_ids', 'additional_details'],
  properties: {
    intended_outcome_ids: {
      description: 'Intended outcome ids',
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    additional_details: {
      description: 'Additional details',
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

export const surveyPartnershipsSchema: OpenAPIV3.SchemaObject = {
  title: 'Survey partnerships',
  type: 'object',
  additionalProperties: false,
  required: ['indigenous_partnerships', 'stakeholder_partnerships'],
  properties: {
    indigenous_partnerships: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1
      }
    },
    stakeholder_partnerships: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

export const surveyProprietorSchema: OpenAPIV3.SchemaObject = {
  title: 'survey proprietor response object',
  type: 'object',
  nullable: true,
  additionalProperties: false,
  required: ['category_rationale', 'proprietor_name', 'disa_required'],
  properties: {
    survey_data_proprietary: {
      description: 'Survey data proprietary',
      type: 'string'
    },
    proprietary_data_category: {
      description: 'Proprietary data category',
      type: 'integer',
      nullable: true
    },
    proprietor_type_name: {
      description: 'Proprietor type name',
      type: 'string',
      nullable: true
    },
    proprietor_type_id: {
      description: 'Proprietor type id',
      type: 'integer',
      nullable: true
    },
    first_nations_name: {
      description: 'First nations name',
      type: 'string',
      nullable: true
    },
    first_nations_id: {
      description: 'First nations id',
      type: 'integer',
      nullable: true
    },
    category_rationale: {
      description: 'Category rationale',
      type: 'string'
    },
    proprietor_name: {
      description: 'Proprietor name',
      type: 'string'
    },
    disa_required: {
      description: 'Disa required',
      oneOf: [{ type: 'string' }, { type: 'boolean' }],
      nullable: true
    }
  }
};

export const surveyLocationSchema: OpenAPIV3.SchemaObject = {
  title: 'survey location response object',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'geojson', 'revision_count'],
  properties: {
    survey_location_id: {
      description: 'Survey location id',
      type: 'integer',
      nullable: true
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer'
    },
    leaflet_id: {
      description: 'Leaflet id',
      type: 'integer',
      nullable: true
    },
    uuid: {
      description: 'Survey location uuid',
      type: 'string',
      format: 'uuid',
      nullable: true
    },
    name: {
      description: 'Name',
      type: 'string'
    },
    description: {
      description: 'Description',
      type: 'string'
    },
    geojson: {
      description: 'Geojson',
      type: 'array',
      items: {
        type: 'object'
      }
    },
    geometry: {
      description: 'Geometry',
      type: 'object',
      nullable: true
    },
    geography: {
      description: 'Geography',
      type: 'string'
    },
    revision_count: {
      description: 'The integer of times the record has been revised.',
      type: 'integer',
      minimum: 0
    }
  }
};

export const surveySiteSelectionSchema: OpenAPIV3.SchemaObject = {
  title: 'survey site selection response object',
  type: 'object',
  additionalProperties: false,
  required: ['strategies', 'stratums'],
  properties: {
    strategies: {
      description: 'Strategies',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    stratums: {
      description: 'Stratums',
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description'],
        properties: {
          name: {
            description: 'Name',
            type: 'string'
          },
          description: {
            description: 'Description',
            type: 'string',
            nullable: true
          },
          survey_id: {
            description: 'Survey id',
            type: 'integer',
            nullable: true
          },
          survey_stratum_id: {
            description: 'Survey stratum id',
            type: 'integer',
            nullable: true,
            minimum: 1
          },
          sample_stratum_count: {
            description: 'Sample stratum count',
            type: 'number'
          },
          revision_count: {
            description: 'Revision count',
            type: 'integer'
          }
        }
      }
    }
  }
};

export const surveyBlockSchema: OpenAPIV3.SchemaObject = {
  title: 'Survey Block',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description'],
  properties: {
    survey_block_id: {
      description: 'Survey block id',
      type: 'integer',
      nullable: true,
      minimum: 1
    },
    survey_id: {
      description: 'Survey id',
      type: 'integer',
      nullable: true
    },
    name: {
      description: 'Name',
      type: 'string',
      nullable: true
    },
    description: {
      description: 'Description',
      type: 'string',
      nullable: true
    },
    sample_block_count: {
      description: 'Sample block count',
      type: 'number'
    },
    revision_count: {
      description: 'Revision count',
      type: 'integer'
    }
  }
};

export const surveySupplementaryDataSchema: OpenAPIV3.SchemaObject = {
  description: 'Survey supplementary data',
  type: 'object',
  additionalProperties: false,
  required: ['survey_metadata_publish'],
  properties: {
    survey_metadata_publish: {
      description: 'Survey metadata publish record',
      type: 'object',
      additionalProperties: false,
      nullable: true,
      required: [
        'survey_metadata_publish_id',
        'survey_id',
        'event_timestamp',
        'submission_uuid',
        'create_date',
        'create_user',
        'update_date',
        'update_user',
        'revision_count'
      ],
      properties: {
        survey_metadata_publish_id: {
          type: 'integer',
          minimum: 1
        },
        survey_id: {
          type: 'integer',
          minimum: 1
        },
        event_timestamp: {
          type: 'string',
          description: 'ISO 8601 date string'
        },
        submission_uuid: {
          type: 'string',
          format: 'uuid'
        },
        ...updateCreateUserPropertiesSchema.properties
      }
    }
  }
};
