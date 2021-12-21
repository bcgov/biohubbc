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
            columns: ['Lone Cows'],
            not: true
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
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['eventID'] }, target: 'eventID' },
          { source: { columns: ['eventDate'] }, target: 'eventDate' },
          {
            source: { columns: ['verbatimCoordinatesUTM', 'verbatimCoordinatesLatLong'] },
            target: 'verbatimCoordinates'
          }
        ]
      },
      {
        fileName: 'occurrence',
        conditionalFields: ['individualCount'],
        columns: [
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['occurrenceID'] }, target: 'occurrenceID' },
          { source: { columns: ['individualCount'] }, target: 'individualCount' },
          { source: { columns: ['vernacularName'] }, target: 'associatedTaxa' },
          { source: { columns: ['lifeStage'] }, target: 'lifeStage' },
          { source: { columns: ['sex'] }, target: 'sex' },
          { source: { value: 'Approved' }, target: 'Status' }
        ]
      },
      {
        fileName: 'taxon',
        columns: [
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['occurrenceID'] }, target: 'occurrenceID' },
          { source: { columns: ['vernacularName'] }, target: 'vernacularName' }
        ]
      },
      {
        fileName: 'resourcerelationship',
        conditionalFields: ['resourceID'],
        columns: [
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['resourceID'] }, target: 'resourceID' },
          { source: { columns: ['relatedResourceID'] }, target: 'relatedResourceID' },
          { source: { columns: ['relationshipOfResource'] }, target: 'relationshipOfResource' }
        ]
      },
      {
        fileName: 'measurementorfact',
        columns: [
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['eventID'] }, target: 'measurementID' },
          { source: { value: 'Habitat Description' }, target: 'measurementType' },
          { source: { columns: ['effort_habitat_description'] }, target: 'measurementValue' }
        ]
      },
      {
        fileName: 'measurementorfact',
        columns: [
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['occurrenceID'] }, target: 'measurementID' },
          { source: { value: 'Stratum' }, target: 'measurementType' },
          { source: { columns: ['summary_stratum'] }, target: 'measurementValue' }
        ]
      },
      {
        fileName: 'measurementorfact',
        columns: [
          { source: { columns: ['id'] }, target: 'id' },
          { source: { columns: ['occurrenceID'] }, target: 'measurementID' },
          { source: { value: 'Activity' }, target: 'measurementType' },
          { source: { columns: ['observation_activity'] }, target: 'measurementValue' }
        ]
      }
    ]
  };

  const ajv = new Ajv();

  it('validates against submissionTransformationSchema', () => {
    expect(ajv.validate(submissionTransformationSchema, exampleSchema), JSON.stringify(ajv.errors)).to.be.true;
  });
});
