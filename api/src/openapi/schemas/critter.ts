import { OpenAPIV3 } from 'openapi-types';

const critterSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    animal_id: {
      type: 'string'
    },
    wlh_id: {
      type: 'string'
    },
    taxon_id: {
      type: 'string'
    },
    sex: {
      type: 'string'
    }
  }
};

const captureSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_location_id: {
      type: 'string',
      format: 'uuid'
    },
    release_location_id: {
      type: 'string',
      format: 'uuid'
    },
    capture_location: {
      type: 'object'
    },
    release_location: {
      type: 'object'
    },
    force_create_release: {
      type: 'boolean'
    },
    capture_timestamp: {
      type: 'string'
    },
    release_timestamp: {
      type: 'string'
    },
    capture_comment: {
      type: 'string'
    },
    release_comment: {
      type: 'string'
    }
  }
};

const collectionUnits: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    critter_collection_unit: {
      type: 'string',
      format: 'uuid'
    },
    collection_unit_id: {
      type: 'string',
      format: 'uuid'
    }
  }
};

const markingSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    critter_id: {
      type: 'string',
      format: 'uuid'
    },
    marking_id: {
      type: 'string',
      format: 'uuid'
    },
    marking_type_id: {
      type: 'string',
      format: 'uuid'
    },
    taxon_marking_body_location_id: {
      type: 'string',
      format: 'uuid'
    },
    primary_colour_id: {
      type: 'string',
      format: 'uuid'
    },
    secondary_colour_id: {
      type: 'string',
      format: 'uuid'
    },
    marking_comment: {
      type: 'string'
    }
  }
};

const locationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    location_id: {
      type: 'string',
      format: 'uuid'
    },
    latitude: {
      type: 'number'
    },
    longitude: {
      type: 'number'
    },
    coordinate_uncertainty: {
      type: 'number'
    },
    coordinate_uncertainty_unit: {
      type: 'string'
    }
  }
};

const mortalitySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    mortality_id: { type: 'string', format: 'uuid' },
    critter_id: { type: 'string', format: 'uuid' },
    location_id: { type: 'string', format: 'uuid' },
    mortality_comment: { type: 'string' },
    proximate_cause_of_death_id: { type: 'string', format: 'uuid' },
    proximate_cause_of_death_confidence: { type: 'string' },
    proximate_predated_by_taxon_id: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_id: { type: 'string', format: 'uuid' },
    ultimate_cause_of_death_confidence: { type: 'string' },
    ultimate_predated_by_taxon_id: { type: 'string', format: 'uuid' },
    projection_mode: { type: 'string', enum: ['wgs', 'utm'] },
    location: { type: 'object' }
  }
};

const qualitativeMeasurementSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    measurement_qualitative_id: { type: 'string', format: 'uuid' },
    taxon_measurement_id: { type: 'string' },
    qualitative_option_id: {
      type: 'string'
    },
    measured_timestamp: { type: 'string' },
    measurement_comment: { type: 'string' }
  }
};

const quantitativeMeasurmentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    measurement_qualitative_id: { type: 'string', format: 'uuid' },
    taxon_measurement_id: { type: 'string' },
    qualitative_option_id: {
      type: 'string',
      format: 'uuid'
    },
    value: {
      type: 'number'
    },
    measured_timestamp: { type: 'string' },
    measurement_comment: { type: 'string' }
  }
}

export const critterCreateRequestObject: OpenAPIV3.SchemaObject = {
  title: 'Bulk post request object',
  type: 'object',
  properties: {
    critters: {
      title: 'critters',
      type: 'array',
      items: {
        title: 'critter',
        ...critterSchema
      }
    },
    captures: {
      title: 'captures',
      type: 'array',
      items: {
        title: 'capture',
        ...captureSchema
      }
    },
    collections: {
      title: 'collection units',
      type: 'array',
      items: {
        title: 'collection unit',
        ...collectionUnits
      }
    },
    markings: {
      title: 'markings',
      type: 'array',
      items: {
        title: 'marking',
        ...markingSchema
      }
    },
    locations: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        ...locationSchema
      }
    },
    mortalities: {
      title: 'locations',
      type: 'array',
      items: {
        title: 'location',
        ...mortalitySchema
      }
    },
    qualitative_measurements: {
      title: 'qualitative measurements',
      type: 'array',
      items: {
        title: 'qualitative measurement',
        ...qualitativeMeasurementSchema
      }
    },
    quantitative_measurements: {
      title: 'quantitative measurements',
      type: 'array',
      items: {
        title: 'quantitative measurement',
        ...quantitativeMeasurmentSchema
      }
    }
  }
};
