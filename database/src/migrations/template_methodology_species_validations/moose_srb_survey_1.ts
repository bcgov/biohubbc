import { basicCodeValidator, basicNumericValidator, MooseItems } from './picklist_variables/v0.2';
export const mooseSrbJSON = {
  name: '',
  description: '',
  files: [
    {
      name: 'Strata Metadata',
      description: '',
      columns: [
        {
          name: 'Stratum',
          description: '',
          validations: basicNumericValidator()
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Stratum', 'Stratum Definition']
          }
        }
      ]
    },
    {
      name: 'Block Summary',
      description: '',
      columns: [
        {
          name: 'Stratum',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Stratum Area (km2)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sampled (Y/N)',
          description: '',
          validations: basicCodeValidator(MooseItems.yN)
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
              'Stratum',
              'Stratum Area (km2)',
              'Sampled (Y/N)',
              'Block Summary Comments'
            ]
          }
        }
      ]
    },
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
          validations: basicCodeValidator(MooseItems.aircraftType)
        },
        {
          name: 'Light',
          description: '',
          validations: basicCodeValidator(MooseItems.light)
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
          validations: basicCodeValidator(MooseItems.uTMZone)
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
          validations: basicCodeValidator(MooseItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(MooseItems.latLongUnits)
        },
        {
          name: 'Species',
          description: '',
          validations: basicCodeValidator(MooseItems.species)
        },
        {
          name: 'Yearling Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Bulls - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sub-Prime Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Prime Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Senior Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'RISC Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'RISC Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'RISC Class III Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Oswald (1997) Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Oswald (1997) Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Oswald (1997) Class III Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Bulls - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Bulls - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Lone Cows',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Cow W/1 calf',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Cow W/2 calves',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Lone Calf',
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
          name: 'Spike/Fork Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '3 Brow/10 Points Bulls',
          description: '',
          validations: basicNumericValidator()
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
          validations: basicCodeValidator(MooseItems.activityObservation)
        },
        {
          name: 'Number of Marked Animals Observed',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Survey or Telemetry Search',
          description: '',
          validations: basicCodeValidator(MooseItems.searchType)
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
              'Species',
              'Yearling Bulls',
              'Sub-Prime Bulls',
              'Prime Bulls',
              'Senior Bulls',
              'RISC Class I Bulls',
              'RISC Class II Bulls',
              'RISC Class III Bulls',
              'Oswald (1997) Class I Bulls',
              'Oswald (1997) Class II Bulls',
              'Oswald (1997) Class III Bulls',
              'Adult Bulls - Unclassified',
              'Bulls - Unclassified',
              'Lone Cows',
              'Cow W/1 calf',
              'Cow W/2 calves',
              'Lone calf',
              'Adult Unclassified Sex',
              'Unclassified Age/Sex',
              'Total Count',
              'Spike/Fork Bulls',
              '3 Brow/10 Points Bulls',
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
          validations: basicCodeValidator(MooseItems.uTMZone)
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
          validations: basicCodeValidator(MooseItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(MooseItems.latLongUnits)
        },
        {
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: basicCodeValidator(MooseItems.targetType)
        },
        {
          name: 'Mark Type',
          description: '',
          validations: basicCodeValidator(MooseItems.markType)
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: basicCodeValidator(MooseItems.frequencyUnits)
        },
        {
          name: 'Location of Identifier on Individual',
          description: '',
          validations: basicCodeValidator(MooseItems.locationOfIdentifier)
        },
        {
          name: 'Shape',
          description: '',
          validations: basicCodeValidator(MooseItems.shape)
        },
        {
          name: 'Pattern',
          description: '',
          validations: basicCodeValidator(MooseItems.pattern)
        },
        {
          name: 'Color',
          description: '',
          validations: basicCodeValidator(MooseItems.color)
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
          validations: basicCodeValidator(MooseItems.uTMZone)
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
          validations: basicCodeValidator(MooseItems.gPSDatum)
        },
        {
          name: 'Lat/Long Units',
          description: '',
          validations: basicCodeValidator(MooseItems.latLongUnits)
        },
        {
          name: 'Species',
          description: '',
          validations: basicCodeValidator(MooseItems.species)
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
          validations: basicCodeValidator(MooseItems.speciesOccurrenceStatus)
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(MooseItems.activityIncidentalObservation)
        },
        {
          name: 'Feature Type',
          description: '',
          validations: basicCodeValidator(MooseItems.featureType)
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(MooseItems.signType)
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
        required_files: [
          'Strata Metadata',
          'Block Summary',
          'Effort & Site Conditions',
          'Observations',
          'Marked Animals',
          'Incidental Observations'
        ]
      }
    },
    {
      mimetype_validator: {
        reg_exps: ['application\\/vnd.*']
      }
    }
  ]
};
