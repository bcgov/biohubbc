import { basicCodeValidator, basicNumericValidator, DeerItems } from './picklist_variables/v0.2';

export const deerAerialNonSRBRecruitCompJSON = {
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
          validations: basicCodeValidator(DeerItems.aircraftType)
        },
        {
          name: 'Light',
          description: '',
          validations: basicCodeValidator(DeerItems.light)
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
              'Block Area (km2)',
              'Date',
              'Start Time 1 (24hrs)',
              'End Time 1 (24hrs)',
              'Start Time 2 (24hrs)',
              'End Time 2 (24hrs)',
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
              'Snow Depth',
              'Days Since Snowfall',
              'Weather Description',
              'Location Description',
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
          validations: basicCodeValidator(DeerItems.uTMZone)
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
          validations: basicCodeValidator(DeerItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(DeerItems.latLongUnits)
        },
        {
          name: 'Species',
          description: '',
          validations: basicCodeValidator(DeerItems.species)
        },
        {
          name: 'RISC Class I Buck',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'RISC Class II Buck',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'RISC Class III Buck',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'RISC Class IV Buck',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Buck < 4 Points',
          desription: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Buck >= 4 pts',
          desription: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Bucks - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Bucks',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Does',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Fawns',
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
          validations: basicCodeValidator(DeerItems.signType)
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: basicCodeValidator(DeerItems.signAge)
        },
        {
          name: 'Topography',
          description: '',
          validations: basicCodeValidator(DeerItems.topography)
        },
        {
          name: 'Habitat',
          description: '',
          validations: basicCodeValidator(DeerItems.habitat)
        },
        {
          name: 'Veg Cover (%)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Snow Cover (%)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(DeerItems.activityObservation)
        },
        {
          name: 'Number of Marked Animals Observed',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Survey or Telemetry',
          description: '',
          validations: basicCodeValidator(DeerItems.searchType)
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
              'Species',
              'RISC Class I Buck',
              'RISC Class II Buck',
              'RISC Class III Buck',
              'RISC Class IV Buck',
              'Buck < 4 Points',
              'Buck >= 4 pts',
              'Adult Bucks - Unclassified',
              'Unclassified Bucks',
              'Does',
              'Fawns',
              'Adult Unclassified Sex',
              'Unclassified Age/Sex',
              'Total Count',
              'Sign Type',
              'Age of Sign',
              'Topography',
              'Habitat',
              'Veg Cover (%)',
              'Snow Cover (%)',
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
          validations: basicCodeValidator(DeerItems.uTMZone)
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
          validations: basicCodeValidator(DeerItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(DeerItems.latLongUnits)
        },
        {
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: basicCodeValidator(DeerItems.targetType)
        },
        {
          name: 'Mark Type',
          description: '',
          validations: basicCodeValidator(DeerItems.markType)
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: basicCodeValidator(DeerItems.frequencyUnits)
        },
        {
          name: 'Location of Identifier on Individual',
          description: '',
          validations: basicCodeValidator(DeerItems.locationOfIdentifier)
        },
        {
          name: 'Shape',
          description: '',
          validations: basicCodeValidator(DeerItems.shape)
        },
        {
          name: 'Pattern',
          description: '',
          validations: basicCodeValidator(DeerItems.pattern)
        },
        {
          name: 'Color',
          description: '',
          validations: basicCodeValidator(DeerItems.color)
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
          validations: basicCodeValidator(DeerItems.uTMZone)
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
          validations: basicCodeValidator(DeerItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(DeerItems.latLongUnits)
        },
        {
          name: 'Adult Males',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adilt Females',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult - Unclassified Sex',
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
          validations: basicCodeValidator(DeerItems.speciesOccurrenceStatus)
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(DeerItems.activityIncidentalObservation)
        },
        {
          name: 'Feature Type',
          description: '',
          validations: basicCodeValidator(DeerItems.featureType)
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(DeerItems.signType)
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

export const ITemplateValidation = {
  name: '',
  description: '',
  files: [
    {
      name: '',
      description: '',
      columns: [
        {
          name: '',
          description: '',
          validations: []
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: []
          }
        }
      ]
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: []
      }
    },
    {
      mimetype_validator: {
        reg_exps: []
      }
    }
  ]
};
