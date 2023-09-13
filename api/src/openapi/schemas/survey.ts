import { GeoJSONFeature } from './geoJson';

export const SurveyLocationRequestObject = {
  description: 'Survey location data',
  type: 'array',
  items: {
    type: 'object',
    required: [],
    properties: {
      survey_location_id: {
        type: 'integer',
        minimum: 1
      },
      name: {
        type: 'string',
        maxLength: 100
      },
      description: {
        type: 'string',
        maxLength: 250
      },
      geometry: {
        type: 'string',
        nullable: true
      },
      geography: {
        type: 'string'
      },
      geojson: {
        type: 'array',
        items: {
          ...(GeoJSONFeature as object)
        }
      },
      revision_count: {
        type: 'integer',
        minimum: 0
      }
    }
  }
};

export const SurveyLocationPostRequestObject = {
  description: 'Survey location data',
  type: 'array',
  items: {
    type: 'object',
    required: [],
    properties: {
      survey_location_id: {
        type: 'integer',
        minimum: 1
      },
      name: {
        type: 'string',
        maxLength: 100
      },
      description: {
        type: 'string',
        maxLength: 250
      },
      geojson: {
        type: 'array',
        items: {
          ...(GeoJSONFeature as object)
        }
      },
      revision_count: {
        type: 'integer',
        minimum: 0
      }
    }
  }
};
