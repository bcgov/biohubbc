import { OpenAPIV3 } from 'openapi-types';

const ObservationQualitativeEnvironment: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'observation_environment_qualitative_id',
    'environment_qualitative_id',
    'environment_qualitative_option_id'
  ],
  properties: {
    observation_environment_qualitative_id: {
      type: 'integer',
      minimum: 1
    },
    environment_qualitative_id: {
      type: 'string',
      format: 'uuid'
    },
    environment_qualitative_option_id: {
      type: 'string',
      format: 'uuid'
    }
  }
};

const ObservationQuantitativeEnvironment: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['observation_environment_quantitative_id', 'environment_quantitative_id', 'value'],
  properties: {
    observation_environment_quantitative_id: {
      type: 'integer',
      minimum: 1
    },
    environment_quantitative_id: {
      type: 'string',
      format: 'uuid'
    },
    value: {
      type: 'number'
    }
  }
};

const ObservationSubcountSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'An observation subcount record. Each subcount defines additional attributes/details about a subset of the observed taxa in the observation.',
  additionalProperties: false,
  required: ['observation_subcount_id', 'subcount', 'comment', 'qualitative_measurements', 'quantitative_measurements'],
  properties: {
    observation_subcount_id: {
      type: 'integer',
      minimum: 1
    },
    comment: {
      type: 'string',
      nullable: true,
      description: 'A comment or note about the subcount record.'
    },
    subcount: {
      type: 'number',
      minimum: 0
    },
    qualitative_measurements: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['critterbase_taxon_measurement_id', 'critterbase_measurement_qualitative_option_id'],
        properties: {
          critterbase_taxon_measurement_id: {
            type: 'string',
            format: 'uuid'
          },
          critterbase_measurement_qualitative_option_id: {
            type: 'string',
            format: 'uuid'
          }
        }
      }
    },
    quantitative_measurements: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['critterbase_taxon_measurement_id', 'value'],
        properties: {
          critterbase_taxon_measurement_id: {
            type: 'string',
            format: 'uuid'
          },
          value: {
            type: 'number'
          }
        }
      }
    }
  }
};

export const insertObservationSchema: OpenAPIV3.SchemaObject = {
  description: 'Insert an observation record.',
  type: 'object',
  additionalProperties: false,
  required: ['standardColumns', 'subcounts'],
  properties: {
    standardColumns: {
      description: 'Standard column data for an observation record.',
      type: 'object',
      additionalProperties: false,
      required: [
        'itis_tsn',
        'itis_scientific_name',
        'survey_sample_period_id',
        'count',
        'latitude',
        'longitude',
        'observation_date',
        'observation_time',
        'observation_sign_id',
        'qualitative_environments',
        'quantitative_environments'
      ],
      properties: {
        itis_tsn: {
          type: 'integer'
        },
        itis_scientific_name: {
          type: 'string',
          nullable: true
        },
        survey_sample_period_id: {
          type: 'integer',
          minimum: 1,
          nullable: true
        },
        count: {
          type: 'integer',
          description: "The observation record's count.",
          nullable: true
        },
        latitude: {
          type: 'number',
          nullable: true
        },
        longitude: {
          type: 'number',
          nullable: true
        },
        observation_date: {
          type: 'string',
          nullable: true
        },
        observation_time: {
          type: 'string',
          nullable: true
        },
        observation_sign_id: {
          type: 'integer',
          minimum: 1,
          description:
            'The observation observation sign ID, indicating whether the observation was a direct sighting, footprints, scat, etc.',
          nullable: true
        },
        qualitative_environments: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['environment_qualitative_id', 'environment_qualitative_option_id'],
            properties: {
              environment_qualitative_id: {
                type: 'string',
                format: 'uuid'
              },
              environment_qualitative_option_id: {
                type: 'string',
                format: 'uuid'
              }
            }
          }
        },
        quantitative_environments: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['environment_quantitative_id', 'value'],
            properties: {
              environment_quantitative_id: {
                type: 'string',
                format: 'uuid'
              },
              value: {
                type: 'number'
              }
            }
          }
        }
      }
    },
    subcounts: {
      description: 'An array of observation subcount records.',
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['subcount', 'comment', 'qualitative_measurements', 'quantitative_measurements'],
        properties: {
          subcount: {
            type: 'number',
            description: "The subcount record's count."
          },
          comment: {
            type: 'string',
            nullable: true,
            description: 'A comment or note about the subcount'
          },
          qualitative_measurements: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                measurement_id: {
                  type: 'string'
                },
                measurement_option_id: {
                  type: 'string'
                }
              }
            }
          },
          quantitative_measurements: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                measurement_id: {
                  type: 'string'
                },
                measurement_value: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  }
};

export const updateObservationSchema: OpenAPIV3.SchemaObject = {
  description: 'Update an observation record.',
  type: 'object',
  additionalProperties: false,
  required: ['standardColumns', 'subcounts'],
  properties: {
    standardColumns: {
      description: 'Standard column data for an observation record.',
      type: 'object',
      additionalProperties: false,
      required: [
        'survey_observation_id',
        'itis_tsn',
        'itis_scientific_name',
        'survey_sample_period_id',
        'count',
        'latitude',
        'longitude',
        'observation_date',
        'observation_time',
        'observation_sign_id',
        'qualitative_environments',
        'quantitative_environments'
      ],
      properties: {
        survey_observation_id: {
          type: 'integer',
          minimum: 1
        },
        itis_tsn: {
          type: 'integer'
        },
        itis_scientific_name: {
          type: 'string',
          nullable: true
        },
        survey_sample_period_id: {
          type: 'integer',
          minimum: 1,
          nullable: true
        },
        count: {
          type: 'integer',
          description: "The observation record's count.",
          nullable: true
        },
        latitude: {
          type: 'number',
          nullable: true
        },
        longitude: {
          type: 'number',
          nullable: true
        },
        observation_date: {
          type: 'string',
          nullable: true
        },
        observation_time: {
          type: 'string',
          nullable: true
        },
        observation_sign_id: {
          type: 'integer',
          minimum: 1,
          description:
            'The observation observation sign ID, indicating whether the observation was a direct sighting, footprints, scat, etc.',
          nullable: true
        },
        qualitative_environments: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['environment_qualitative_id', 'environment_qualitative_option_id'],
            properties: {
              environment_qualitative_id: {
                type: 'string',
                format: 'uuid'
              },
              environment_qualitative_option_id: {
                type: 'string',
                format: 'uuid'
              }
            }
          }
        },
        quantitative_environments: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['environment_quantitative_id', 'value'],
            properties: {
              environment_quantitative_id: {
                type: 'string',
                format: 'uuid'
              },
              value: {
                type: 'number'
              }
            }
          }
        }
      }
    },
    subcounts: {
      description: 'An array of observation subcount records.',
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['subcount', 'comment', 'qualitative_measurements', 'quantitative_measurements'],
        properties: {
          observation_subcount_id: {
            type: 'integer',
            nullable: true,
            minimum: 1
          },
          subcount: {
            type: 'number',
            description: "The subcount record's count."
          },
          comment: {
            type: 'string',
            nullable: true,
            description: 'A comment or note about the subcount'
          },
          qualitative_measurements: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                measurement_id: {
                  type: 'string'
                },
                measurement_option_id: {
                  type: 'string'
                }
              }
            }
          },
          quantitative_measurements: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                measurement_id: {
                  type: 'string'
                },
                measurement_value: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  }
};

export const findObservationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    // Observation data
    'survey_observation_id',
    'survey_id',
    'itis_tsn',
    'itis_scientific_name',
    'survey_sample_period_id',
    'latitude',
    'longitude',
    'count',
    'observation_date',
    'observation_time',
    'observation_sign_id',
    // Observation environment data
    'qualitative_environments',
    'quantitative_environments',
    // Observation subcount data
    'subcounts',
    // Additional sampling information
    'survey_sample_site_id',
    'survey_sample_site_name',
    'method_technique_id',
    'method_technique_name',
    'survey_sample_period_start_datetime'
  ],
  properties: {
    // Observation data
    survey_observation_id: {
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      type: 'integer',
      minimum: 1
    },
    itis_tsn: {
      type: 'integer',
      minimum: 1
    },
    itis_scientific_name: {
      type: 'string',
      nullable: true
    },
    survey_sample_period_id: {
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    latitude: {
      type: 'number',
      nullable: true,
      minimum: -90,
      maximum: 90
    },
    longitude: {
      type: 'number',
      nullable: true,
      minimum: -180,
      maximum: 180
    },
    count: {
      type: 'integer',
      minimum: 0
    },
    observation_date: {
      type: 'string',
      nullable: true
    },
    observation_time: {
      type: 'string',
      nullable: true
    },
    observation_sign_id: {
      type: 'integer',
      minimum: 1,
      description:
        'The observation sign ID, indicating whether the observation was a direct sighting, footprints, scat, etc.',
      nullable: true
    },
    // Observation environment data
    qualitative_environments: {
      type: 'array',
      items: ObservationQualitativeEnvironment
    },
    quantitative_environments: {
      type: 'array',
      items: ObservationQuantitativeEnvironment
    },
    // Observation subcount data
    subcounts: {
      type: 'array',
      description: 'All subcount records for the observation.',
      items: ObservationSubcountSchema
    },
    // Additional sampling information
    survey_sample_site_id: {
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    survey_sample_site_name: {
      type: 'string',
      nullable: true
    },
    method_technique_id: {
      type: 'integer',
      minimum: 1,
      nullable: true
    },
    method_technique_name: {
      type: 'string',
      nullable: true
    },
    survey_sample_period_start_datetime: {
      type: 'string',
      nullable: true
    }
  }
};

export const findObservationsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: findObservationSchema
};

export const findFlattenedObservationsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [
      'survey_observation_id',
      'survey_id',
      'itis_tsn',
      'itis_scientific_name',
      'latitude',
      'longitude',
      'count',
      'observation_date',
      'observation_time',
      'observation_sign_id',
      'subcount',
      'survey_sample_site_id',
      'survey_sample_site_name',
      'method_technique_id',
      'method_technique_name',
      'survey_sample_period_id',
      'survey_sample_period_start_datetime',
      'qualitative_environments',
      'quantitative_environments'
    ],
    properties: {
      survey_observation_id: {
        type: 'integer',
        minimum: 1
      },
      survey_id: {
        type: 'integer',
        minimum: 1
      },
      itis_tsn: {
        type: 'integer',
        minimum: 1
      },
      itis_scientific_name: {
        type: 'string',
        nullable: true
      },
      latitude: {
        type: 'number',
        nullable: true,
        minimum: -90,
        maximum: 90
      },
      longitude: {
        type: 'number',
        nullable: true,
        minimum: -180,
        maximum: 180
      },
      count: {
        type: 'integer'
      },
      observation_date: {
        type: 'string',
        nullable: true
      },
      observation_time: {
        type: 'string',
        nullable: true
      },
      observation_sign_id: {
        type: 'integer',
        minimum: 1,
        description:
          'The observation sign ID, indicating whether the observation was a direct sighting, footprints, scat, etc.',
        nullable: true
      },
      qualitative_environments: {
        type: 'array',
        items: ObservationQualitativeEnvironment
      },
      quantitative_environments: {
        type: 'array',
        items: ObservationQuantitativeEnvironment
      },
      subcount: ObservationSubcountSchema,
      survey_sample_site_id: {
        type: 'integer',
        minimum: 1,
        nullable: true
      },
      survey_sample_site_name: {
        type: 'string',
        nullable: true
      },
      method_technique_id: {
        type: 'integer',
        minimum: 1,
        nullable: true
      },
      method_technique_name: {
        type: 'string',
        nullable: true
      },
      survey_sample_period_id: {
        type: 'integer',
        minimum: 1,
        nullable: true
      },
      survey_sample_period_start_datetime: {
        type: 'string',
        nullable: true
      }
    }
  }
};

export const observationsSupplementaryDataSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'observationCount',
    'qualitative_measurements',
    'quantitative_measurements',
    'qualitative_environments',
    'quantitative_environments',
    'sampling_data'
  ],
  properties: {
    observationCount: {
      type: 'integer',
      minimum: 0
    },
    qualitative_measurements: {
      description: 'All qualitative measurement type definitions for the observations.',
      type: 'array',
      items: {
        description: 'A qualitative measurement type definition, with array of valid/accepted options',
        type: 'object',
        additionalProperties: false,
        required: ['itis_tsn', 'taxon_measurement_id', 'measurement_name', 'measurement_desc', 'options'],
        properties: {
          itis_tsn: {
            type: 'integer',
            nullable: true
          },
          taxon_measurement_id: {
            type: 'string'
          },
          measurement_name: {
            type: 'string'
          },
          measurement_desc: {
            type: 'string',
            nullable: true
          },
          options: {
            description: 'Valid options for the measurement.',
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['qualitative_option_id', 'option_label', 'option_value', 'option_desc'],
              properties: {
                qualitative_option_id: {
                  type: 'string'
                },
                option_label: {
                  type: 'string',
                  nullable: true
                },
                option_value: {
                  type: 'number'
                },
                option_desc: {
                  type: 'string',
                  nullable: true
                }
              }
            }
          }
        }
      }
    },
    quantitative_measurements: {
      description: 'All quantitative measurement type definitions for the observations.',
      type: 'array',
      items: {
        description: 'A quantitative measurement type definition, with possible min/max constraint.',
        type: 'object',
        additionalProperties: false,
        required: [
          'itis_tsn',
          'taxon_measurement_id',
          'measurement_name',
          'measurement_desc',
          'min_value',
          'max_value',
          'unit'
        ],
        properties: {
          itis_tsn: {
            type: 'integer',
            nullable: true
          },
          taxon_measurement_id: {
            type: 'string'
          },
          measurement_name: {
            type: 'string'
          },
          measurement_desc: {
            type: 'string',
            nullable: true
          },
          min_value: {
            type: 'number',
            nullable: true
          },
          max_value: {
            type: 'number',
            nullable: true
          },
          unit: {
            type: 'string',
            nullable: true
          }
        }
      }
    },
    qualitative_environments: {
      description: 'All qualitative environment type definitions for the observations.',
      type: 'array',
      items: {
        description: 'A qualitative environment type definition, with array of valid/accepted options',
        type: 'object',
        additionalProperties: false,
        required: ['environment_qualitative_id', 'name', 'description', 'options'],
        properties: {
          environment_qualitative_id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string',
            nullable: true
          },
          options: {
            description: 'Valid options for the environment.',
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['environment_qualitative_option_id', 'environment_qualitative_id', 'name', 'description'],
              properties: {
                environment_qualitative_option_id: {
                  type: 'string',
                  format: 'uuid'
                },
                environment_qualitative_id: {
                  type: 'string',
                  format: 'uuid'
                },
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string',
                  nullable: true
                }
              }
            }
          }
        }
      }
    },
    quantitative_environments: {
      description: 'All quantitative environment type definitions for the observations.',
      type: 'array',
      items: {
        description: 'A quantitative environment type definition, with possible min/max constraint.',
        type: 'object',
        additionalProperties: false,
        required: ['environment_quantitative_id', 'name', 'description', 'min', 'max', 'unit'],
        properties: {
          environment_quantitative_id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string',
            nullable: true
          },
          min: {
            type: 'number',
            nullable: true
          },
          max: {
            type: 'number',
            nullable: true
          },
          unit: {
            type: 'string',
            nullable: true
          }
        }
      }
    },
    sampling_data: {
      type: 'array',
      items: {
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
      }
    }
  }
};
