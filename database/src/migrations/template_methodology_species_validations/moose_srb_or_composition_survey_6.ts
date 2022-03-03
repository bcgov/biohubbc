import { MooseItems, basicNumericValidator, basicCodeValidator } from './picklist_variables/v0.1';
export const mooseSRBOrCompositionJSON = {
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
          name: 'Stratum Area (km2)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Stratum',
          description: '',
          validations: basicNumericValidator()
        },

        {
          name: 'Sampled (Y/N)',
          description: '',
          validations: basicCodeValidator(MooseItems.basicYN)
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
              'Stratum Area (km2)',
              'Stratum',
              'Sampled (Y/N)',
              'Block Summary Comments'
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
          name: 'WLH ID',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator()
        },

        {
          name: 'Observed',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'With Young',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Collar Heard',
          description: '',
          validations: basicCodeValidator(MooseItems.basicYNDidnt)
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: [
              'WLH ID',
              'Waypoint',
              'Observed',
              'With Young',
              'Collar Heard',
              'Collar Frequency',
              'GPS Unit Name',
              'Best Heard Frequency',
              'Marked Animals Comments'
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
          name: 'Aircraft Type',
          description: '',
          validations: basicCodeValidator(MooseItems.aircraftType)
        },
        {
          name: 'Light',
          description: '',
          validations: basicCodeValidator(MooseItems.basicLight)
        },
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
          name: 'Days Since Snowfall',
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
              'Aircraft Registration',
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
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator()
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
          name: 'Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'No. Spike/Fork',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '3 brow/10 points',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '% Veg Cover',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: '% Snow Cover',
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
            required_columns: [
              'Study Area',
              'Block ID/SU ID',
              'Stratum',
              'GPS Unit Name',
              'Waypoint',
              'Species',
              'Yearling Bulls',
              'Adult Bulls - Unclassified',
              'Sub-Prime Bulls',
              'Prime Bulls',
              'Senior Bulls',
              'Bulls - Unclassified',
              'Lone Cows',
              'Cow W/1 calf',
              'Cow W/2 calves',
              'Lone calf',
              'Unclassified',
              'Total Count',
              'No. Spike/Fork',
              '3 brow/10 points',
              '% Veg Cover',
              '% Snow Cover',
              'Observation Comments',
              'Photos'
            ]
          }
        }
      ]
    },
    {
      name: 'NonTargeted Observations',
      description: '',
      columns: [
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(MooseItems.activityNonTarget)
        },
        {
          name: 'Feature Type',
          description: '',
          validations: basicCodeValidator(MooseItems.featureType)
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(MooseItems.basicSignType)
        },
        {
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator()
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
              'GPS Unit Name',
              'Waypoint',
              'GPS Unit Name',
              'Date',
              'Species',
              'Total Count',
              'Adult Males',
              'Adult Females',
              'Adults - Unclassified Sex',
              'Juvenile Males',
              'Juvenile Females',
              'Juveniles - Unclassified Sex',
              'Unknown Age/Sex',
              'Activity',
              'Feature Type',
              'Sign Type',
              'NonTargeted Observation Comments'
            ]
          }
        }
      ]
    },
    {
      name: 'UTM_LatLong',
      description: '',
      columns: [
        {
          name: 'UTM Zone',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^[1-9]\\d{0,1}[NPQRSTUVWXCDEFGHJKLM]{0,1}$',
                reg_exp_flags: 'i',
                expected_format: 'Must be a number from 1-60, and may include an optional zone letter: 9, 9N'
              }
            }
          ]
        },
        {
          name: 'GPS Datum',
          description: '',
          validations: basicCodeValidator(MooseItems.gPSDatum)
        },
        {
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator()
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
          name: 'Lat',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Long',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Waypoint Elevation (m)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Elevation(-65m)',
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
            required_columns: [
              'GPS Unit Name',
              'Waypoint',
              'UTM Zone',
              'Easting',
              'Northing',
              'GPS Datum',
              'Waypoint Elevation (m)',
              'Elevation(-65m)',
              'Time',
              'Lat/Long Units',
              'Lat',
              'Long',
              'Location Comments'
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
          'Marked Animals',
          'Effort & Site Conditions',
          'Observations',
          'NonTargeted Observations',
          'UTM_LatLong'
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
