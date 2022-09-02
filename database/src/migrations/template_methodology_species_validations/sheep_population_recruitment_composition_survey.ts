import { basicCodeValidator, basicNumericValidator, SheepItems } from './picklist_variables/v0.2';
export const sheepRecruitmentCompositionJSON = {
  name: '',
  description: '',
  files: [
    {
      name: 'Effort & Site Conditions',
      description: '',
      columns: [
        {
          name: 'Total Time (hours)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Time (mins)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Time (mins)/block area (km2)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Aircraft Type',
          description: '',
          validations: basicCodeValidator(SheepItems.aircraftType)
        },
        {
          name: 'Light',
          description: '',
          validations: basicCodeValidator(SheepItems.light)
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: [
              'Study Area',
              'Population Unit',
              'Block ID/SU ID',
              'Population Unit/Block Area (km2)',
              'Date',
              'Start Time 1 (24hrs)',
              'End Time 1 (24hrs)',
              'Start Time 2 (24hrs)',
              'End Time 2 (24hrs)',
              'Start Time 3 (24hrs)',
              'End Time 3 (24hrs)',
              'Start Time 4 (24hrs)',
              'End Time 4 (24hrs)',
              'Total Block Time',
              'Total Time (hours)',
              'Total Time (mins)',
              'Time (mins)/block area (km2)',
              'Aircraft Company',
              'Aircraft Type',
              'Pilot',
              'Navigator',
              'Rear Left Observer',
              'Rear Right Observer',
              'Air Temperature (C)',
              'Visibility',
              'Cloud Cover (%)',
              'Wind Speed',
              'Precipitation',
              'Light',
              'Snow Cover',
              'Snow Conditions',
              'Snow Depth',
              'Days Since Snowfall',
              'Weather Description',
              'Habitat Description',
              'Effort & Site Comments'
            ]
          }
        }
      ]
    },
    {
      name: 'Observations',
      description: '',
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: basicCodeValidator(SheepItems.uTMZone)
        },
        {
          name: 'Easting',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: basicCodeValidator(SheepItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(SheepItems.latLongUnits)
        },
        {
          name: 'Species',
          description: '',
          validations: basicCodeValidator(SheepItems.species)
        },
        {
          name: 'Ram - Class I',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ram - Class II',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ram - Class III',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ram - Class IV',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ewes',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Yearling',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Lamb',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Ewe-Like Sheep',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(SheepItems.signType)
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: basicCodeValidator(SheepItems.signAge)
        },
        {
          name: 'Elevation (m) of Observation',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Habitat',
          description: '',
          validations: basicCodeValidator(SheepItems.habitat)
        },
        {
          name: 'Habitat - Slope',
          description: '',
          validations: basicCodeValidator(SheepItems.habitatSlope)
        },
        {
          name: 'Terrain Obstruction',
          description: '',
          validations: basicCodeValidator(SheepItems.yN)
        },
        {
          name: '% Snow Cover',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '% Canopy Cover',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(SheepItems.activityObservation)
        },
        {
          name: 'Number of Marked Animals Observed',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Survey or Telemetry Search',
          description: '',
          validations: basicCodeValidator(SheepItems.searchType)
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: [
              'Study Area',
              'Population Unit',
              'Block ID/SU ID',
              'Date',
              'UTM Zone',
              'Easting',
              'Northing',
              'Datum',
              'Lat',
              'Long',
              'Lat/Long Units',
              'Species',
              'Ram - Class I',
              'Ram - Class II',
              'Ram - Class III',
              'Ram - Class IV',
              'Ram - Unclassified',
              'Ewes',
              'Yearling',
              'Lamb',
              'Ewe-Like Sheep',
              'Adult Unclassified Sex',
              'Unclassified Age/Sex',
              'Total Count',
              'Sign Type',
              'Age of Sign',
              'Elevation (m) of Observation',
              'Habitat',
              'Habitat - Slope',
              'Terrain Obstruction',
              '% Snow Cover',
              '% Canopy Cover',
              'Activity',
              'Number of Marked Animals Observed',
              'Survey or Telemetry Search',
              'Photos',
              'Observation Comments'
            ]
          }
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: basicCodeValidator(SheepItems.uTMZone)
        },
        {
          name: 'Easting',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: basicCodeValidator(SheepItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(SheepItems.latLongUnits)
        },
        {
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: basicCodeValidator(SheepItems.targetType)
        },
        {
          name: 'Mark Type',
          description: '',
          validations: basicCodeValidator(SheepItems.markType)
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: basicCodeValidator(SheepItems.frequencyUnits)
        },
        {
          name: 'Location of Identifier on Individual',
          description: '',
          validations: basicCodeValidator(SheepItems.locationOfIdentifier)
        },
        {
          name: 'Shape',
          description: '',
          validations: basicCodeValidator(SheepItems.shape)
        },
        {
          name: 'Pattern',
          description: '',
          validations: basicCodeValidator(SheepItems.pattern)
        },
        {
          name: 'Color',
          description: '',
          validations: basicCodeValidator(SheepItems.color)
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: [
              'Study Area',
              'Block ID/SU ID',
              'Date',
              'UTM Zone',
              'Easting',
              'Northing',
              'Datum',
              'Lat',
              'Long',
              'Lat/Long Units',
              'Targeted or Non-Targeted',
              'Wildlife Health ID',
              'Animal ID',
              'Mark Type',
              'Mark ID Value',
              'Frequency',
              'Frequency Unit',
              'Location of Identifier on Individual',
              'Shape',
              'Pattern',
              'Color',
              'Marked Animals Comments'
            ]
          }
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: basicCodeValidator(SheepItems.uTMZone)
        },
        {
          name: 'Easting',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Northing',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Datum',
          description: '',
          validations: basicCodeValidator(SheepItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(SheepItems.latLongUnits)
        },
        {
          name: 'Adult Males',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Females',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adults - Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Juvenile Males',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Juvenile Females',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Juveniles - Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unknown Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Species Occurrence Status',
          description: '',
          validations: basicCodeValidator(SheepItems.speciesOccurrenceStatus)
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(SheepItems.activityIncidentalObservation)
        },
        {
          name: 'Feature Type',
          description: '',
          validations: basicCodeValidator(SheepItems.featureType)
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(SheepItems.signType)
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: [
              'Study Area',
              'Block ID/SU ID',
              'UTM Zone',
              'Easting',
              'Northing',
              'Datum',
              'Lat',
              'Long',
              'Lat/Long Units',
              'Date',
              'Species',
              'Adult Males',
              'Adult Females',
              'Adults - Unclassified Sex',
              'Juvenile Males',
              'Juvenile Females',
              'Juveniles - Unclassified Sex',
              'Unknown Age/Sex',
              'Total Count',
              'Species Occurrence Status',
              'Activity',
              'Feature Type',
              'Sign Type',
              'Photos',
              'Incidental Observation Comments'
            ]
          }
        }
      ]
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: ['Effort & Site Conditions', 'Observations', 'Marked Animals', 'Incidental Observations']
      }
    },
    {
      mimetype_validator: {
        reg_exps: ['application\\/vnd.*']
      }
    }
  ]
};
