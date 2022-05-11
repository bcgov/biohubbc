import { geoJsonFeature } from './geoJson';

export const survey200GetResponseObject = {
  title: 'Survey get response object, for view purposes',
  type: 'object',
  required: [
    'survey_details',
    'species',
    'permit',
    'funding_sources',
    'purpose_and_methodology',
    'proprietor',
    'occurrence_submission',
    'summary_result'
  ],
  properties: {
    survey_details: {
      description: 'Survey Details',
      type: 'object',
      required: [
        'id',
        'biologist_first_name',
        'biologist_last_name',
        'completion_status',
        'start_date',
        'end_date',
        'geometry',
        'publish_date',
        'publish_status',
        'survey_area_name',
        'survey_name'
      ],
      properties: {
        id: {
          description: 'Survey id',
          type: 'number'
        },
        biologist_first_name: {
          type: 'string'
        },
        biologist_last_name: {
          type: 'string'
        },
        completion_status: {
          type: 'string'
        },
        start_date: {
          type: 'string',
          format: 'date',
          description: 'ISO 8601 date string for the funding end_date'
        },
        end_date: {
          type: 'string',
          format: 'date',
          description: 'ISO 8601 date string for the funding end_date'
        },
        geometry: {
          type: 'array',
          items: {
            ...(geoJsonFeature as object)
          }
        },
        publish_date: {
          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
          nullable: true,
          description: 'Determines if the record has been published'
        },
        publish_status: {
          type: 'string'
        },
        survey_area_name: {
          type: 'string'
        },
        survey_name: {
          type: 'string'
        }
      }
    },
    species: {
      description: 'Survey Species',
      type: 'object',
      required: ['focal_species', 'focal_species_names', 'ancillary_species', 'ancillary_species_names'],
      properties: {
        ancillary_species: {
          nullable: true,
          type: 'array',
          items: {
            type: 'number'
          }
        },
        ancillary_species_names: {
          nullable: true,
          type: 'array',
          items: {
            type: 'string'
          }
        },
        focal_species: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        focal_species_names: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    permit: {
      description: 'Survey Permit',
      type: 'object',
      required: ['permit_number', 'permit_type'],
      properties: {
        permit_number: {
          type: 'string',
          nullable: true
        },
        permit_type: {
          type: 'string',
          nullable: true
        }
      }
    },
    funding_sources: {
      description: 'Survey Funding Sources',
      type: 'array',
      items: {
        type: 'object',
        required: ['pfs_id', 'agency_name', 'funding_amount', 'funding_start_date', 'funding_end_date'],
        properties: {
          pfs_id: {
            type: 'number',
            nullable: true
          },
          agency_name: {
            type: 'string',
            nullable: true
          },
          funding_amount: {
            type: 'number',
            nullable: true
          },
          funding_start_date: {
            type: 'string',
            nullable: true,
            description: 'ISO 8601 date string'
          },
          funding_end_date: {
            type: 'string',
            nullable: true,
            description: 'ISO 8601 date string'
          }
        }
      }
    },
    purpose_and_methodology: {
      description: 'Survey Details',
      type: 'object',
      required: [
        'id',
        'field_method_id',
        'additional_details',
        'intended_outcome_id',
        'ecological_season_id',
        'vantage_code_ids',
        'surveyed_all_areas',
        'revision_count'
      ],
      properties: {
        id: {
          type: 'number'
        },
        field_method_id: {
          type: 'number'
        },
        additional_details: {
          type: 'string',
          nullable: true
        },
        intended_outcome_id: {
          type: 'number',
          nullable: true
        },
        ecological_season_id: {
          type: 'number',
          nullable: true
        },
        vantage_code_ids: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        surveyed_all_areas: {
          type: 'string',
          enum: ['true', 'false']
        },
        revision_count: {
          type: 'number'
        }
      }
    },
    proprietor: {
      description: 'Survey Proprietor Details',
      type: 'object',
      nullable: true,
      required: [
        'id',
        'category_rationale',
        'disa_required',
        'first_nations_id',
        'first_nations_name',
        'proprietor_name',
        'proprietor_type_id',
        'proprietor_type_name',
        'revision_count'
      ],
      properties: {
        id: {
          type: 'number'
        },
        category_rationale: {
          type: 'string'
        },
        disa_required: {
          type: 'boolean'
        },
        first_nations_id: {
          type: 'number',
          nullable: true
        },
        first_nations_name: {
          type: 'string',
          nullable: true
        },
        proprietor_name: {
          type: 'string'
        },
        proprietor_type_id: {
          type: 'number'
        },
        proprietor_type_name: {
          type: 'string'
        },
        revision_count: {
          type: 'number'
        }
      }
    },
    occurrence_submission: {
      description: 'Occurrence Submission',
      type: 'object',
      nullable: true,
      required: ['id'],
      properties: {
        id: {
          description: 'A survey occurrence submission ID',
          type: 'number',
          nullable: true,
          example: 1
        }
      }
    },
    summary_result: {
      description: 'Summary Result',
      type: 'object',
      nullable: true,
      required: ['id'],
      properties: {
        id: {
          description: 'A survey summary result ID',
          type: 'number',
          nullable: true,
          example: 1
        }
      }
    }
  }
};
