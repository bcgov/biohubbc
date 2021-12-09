import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { submissionTransformationSchema } from './transformation-schema';

// Useful online json-schema validator: https://www.jsonschemavalidator.net/

describe('submissionTransformationSchema', () => {
  const ajv = new Ajv();

  it('is valid schema', () => {
    expect(ajv.validateSchema(submissionTransformationSchema)).to.be.true;
  });
});

describe('example submission transformation schema', () => {
  const exampleSchema = {
    flatten: [
      {
        fileName: 'Effort & Site Conditions',
        uniqueId: ['Survey Area', 'Block ID/SU ID', 'Stratum']
      },
      {
        fileName: 'Observations',
        uniqueId: ['Waypoint'],
        parent: {
          fileName: 'Effort & Site Conditions',
          uniqueId: ['Survey Area', 'Block ID/SU ID', 'Stratum']
        }
      },
      {
        fileName: 'UTM_LatLong',
        uniqueId: ['Waypoint'],
        parent: {
          fileName: 'Observations',
          uniqueId: ['Waypoint']
        }
      },
      {
        fileName: 'Strata Metadata',
        uniqueId: ['Stratum'],
        parent: {
          fileName: 'Observations',
          uniqueId: ['Stratum']
        }
      }
    ],
    transform: [
      {
        condition: {
          if: {
            columns: ['Lone Cows']
          }
        },
        transformations: [
          {
            fields: {
              id: {
                columns: ['Survey Area', 'Block ID/SU ID', 'Stratum', 'Waypoint'],
                separator: ':'
              },
              eventID: {
                columns: ['Survey Area', 'Block ID/SU ID', 'Stratum'],
                separator: ':'
              },
              eventDate: {
                columns: ['Date']
              },
              verbatimCoordinatesUTM: {
                columns: ['UTM Zone', 'Easting', 'Northing']
              },
              verbatimCoordinatesLatLong: {
                columns: ['lat', 'long']
              },
              occurrenceID: {
                columns: ['Waypoint'],
                unique: 'occ'
              },
              individualCount: {
                columns: ['Lone Cows']
              },
              vernacularName: {
                columns: ['Species']
              },
              lifestage: {
                value: 'Adult'
              },
              sex: {
                value: 'Female'
              }
            }
          }
        ]
      },
      {
        condition: {
          if: {
            columns: ['Cow W/1 calf']
          }
        },
        transformations: [
          {
            fields: {
              id: {
                columns: ['Survey Area', 'Block ID/SU ID', 'Stratum', 'Waypoint'],
                separator: ':'
              },
              eventID: {
                columns: ['Survey Area', 'Block ID/SU ID', 'Stratum'],
                separator: ':'
              },
              eventDate: {
                columns: ['Date']
              },
              verbatimCoordinatesUTM: {
                columns: ['UTM Zone', 'Easting', 'Northing']
              },
              verbatimCoordinatesLatLong: {
                columns: ['lat', 'long']
              },
              occurrenceID: {
                columns: ['Waypoint'],
                unique: 'occ'
              },
              individualCount: {
                columns: ['Cow W/1 calf']
              },
              vernacularName: {
                columns: ['Species']
              },
              lifestage: {
                value: 'Adult'
              },
              sex: {
                value: 'Female'
              },
              resourceID: {
                columns: ['Waypoint'],
                unique: 'occ'
              },
              relatedResourceID: {
                value: ''
              },
              relationshipOfResource: {
                value: 'mother of'
              }
            }
          },
          {
            fields: {
              id: {
                columns: ['Survey Area', 'Block ID/SU ID', 'Stratum', 'Waypoint'],
                separator: ':'
              },
              eventID: {
                columns: ['Survey Area', 'Block ID/SU ID', 'Stratum'],
                separator: ':'
              },
              eventDate: {
                columns: ['Date']
              },
              verbatimCoordinatesUTM: {
                columns: ['UTM Zone', 'Easting', 'Northing']
              },
              verbatimCoordinatesLatLong: {
                columns: ['lat', 'long']
              },
              occurrenceID: {
                columns: ['Waypoint'],
                unique: 'occ'
              },
              individualCount: {
                value: 1
              },
              vernacularName: {
                columns: ['Species']
              },
              lifestage: {
                value: 'Yearling'
              },
              sex: {
                value: 'Unknown'
              },
              resourceID: {
                columns: ['Waypoint'],
                unique: 'occ'
              },
              relatedResourceID: {
                value: ''
              },
              relationshipOfResource: {
                value: 'offspring of'
              }
            }
          }
        ],
        postTransformations: [
          {
            relationship: {
              spreadColumn: 'individualCount',
              uniqueIdColumn: 'occurrenceID'
            }
          }
        ]
      }
    ],
    parse: [
      {
        fileName: 'event',
        columns: [
          { source: 'id', target: 'id' },
          { source: 'eventID', target: 'eventID' },
          { source: 'eventDate', target: 'eventDate' },
          { source: ['verbatimCoordinatesUTM', 'verbatimCoordinatesLatLong'], target: 'verbatimCoordinates' }
        ]
      },
      {
        fileName: 'occurrence',
        conditionalFields: ['individualCount'],
        columns: [
          { source: 'id', target: 'id' },
          { source: 'occurrenceID', target: 'occurrenceID' },
          { source: 'individualCount', target: 'individualCount' },
          { source: 'vernacularName', target: 'associatedTaxa' },
          { source: 'lifeStage', target: 'lifeStage' },
          { source: 'sex', target: 'sex' }
        ]
      },
      {
        fileName: 'taxon',
        columns: [
          { source: 'id', target: 'id' },
          { source: 'occurrenceID', target: 'occurrenceID' },
          { source: 'vernacularName', target: 'vernacularName' }
        ]
      },
      {
        fileName: 'resourcerelationship',
        conditionalFields: ['resourceID'],
        columns: [
          { source: 'id', target: 'id' },
          { source: 'resourceID', target: 'resourceID' },
          { source: 'relatedResourceID', target: 'relatedResourceID' },
          { source: 'relationshipOfResource', target: 'relationshipOfResource' }
        ]
      }
    ]
  };

  const ajv = new Ajv();

  it('validates against submissionTransformationSchema', () => {
    expect(ajv.validate(submissionTransformationSchema, exampleSchema), JSON.stringify(ajv.errors)).to.be.true;
  });
});
