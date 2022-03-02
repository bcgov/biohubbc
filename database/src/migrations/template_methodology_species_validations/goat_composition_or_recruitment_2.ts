import { GoatItems, basicNumericValidator, basicCodeValidator } from './picklist_variables/v0.1';
export const goatCompositionOrRecruitmentJSON = {
  name: '',
  description: '',
  files: [
    {
      name: 'Sampling Unit Summary',
      description: '',
      columns: [
        {
          name: 'Population Unit/Block Area (km2)',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Sampled (Y/N)',
          description: '',
          validations: basicCodeValidator(GoatItems.basicYN)
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
              'Population Unit/Block Area (km2)',
              'Population Unit',
              'Sampled (Y/N)',
              'Sampling Unit Comments'
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
          validations: basicCodeValidator(GoatItems.aircraftType)
        },
        {
          name: 'Light',
          description: '',
          validations: basicCodeValidator(GoatItems.basicLight)
        },
        {
          name: 'Total Time (hours)',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Total Time (mins)',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Time (mins)/block area (km2)',
          description: '',
          validations: basicNumericValidator
        },

        {
          name: 'Days Since Snowfall',
          description: '',
          validations: basicNumericValidator
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
              'Population Unit',
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
              'Aircraft Registration',
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
          name: 'Species',
          description: '',
          validations: basicCodeValidator(GoatItems.species)
        },
        {
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Adult Unclassified',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Kid',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Unclassified',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Nanny',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Billy',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(GoatItems.speciesSignType)
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: basicCodeValidator(GoatItems.basicSignAge)
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(GoatItems.activityObservation)
        },
        {
          name: 'Elevation (m) of Observation',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Habitat',
          description: '',
          validations: basicCodeValidator(GoatItems.habitat)
        },
        {
          name: 'Wind Blown',
          description: '',
          validations: basicCodeValidator(GoatItems.basicYN)
        },
        {
          name: 'Terrain Obstruction',
          description: '',
          validations: basicCodeValidator(GoatItems.basicYN)
        },
        {
          name: 'Count Confidence',
          description: '',
          validations: [
            {
              column_code_validator: {
                name: '',
                description: '',
                allowed_code_values: [
                  { name: 'Low', description: 'Low' },
                  { name: 'Moderate', description: 'Moderate' },
                  { name: 'High', description: 'High' }
                ]
              }
            }
          ]
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
              'Population Unit',
              'GPS Unit Name',
              'Waypoint',
              'Distance (m) and Bearing to Waypoint',
              'Species',
              'Adult - Unclassified',
              'kid',
              'Unclassified',
              'Nanny',
              'Billy',
              'Total Count',
              'Sign Type',
              'Age of Sign',
              'Activity',
              'Elevation (m) of Observation',
              'Habitat',
              'Wind Blown',
              'Terrain Obstruction',
              'Count Confidence',
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
          name: 'Waypoint',
          description: '',
          validations: [
            {
              column_numeric_validator: {
                name: '',
                description: ''
              }
            }
          ]
        },

        {
          name: 'Adult Males',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Adult Females',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Adults - Unclassified Sex',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Juvenile Males',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Juvenile Females',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Juveniles - Unclassified Sex',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Unknown Age/Sex',
          description: '',
          validations: basicNumericValidator
        },

        {
          name: 'Total Count',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeValidator(GoatItems.activityNonTarget)
        },
        {
          name: 'Feature Type',
          description: '',
          validations: basicCodeValidator(GoatItems.featureType)
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeValidator(GoatItems.basicSignType)
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
              'Adult Males',
              'Adult Females',
              'Adults - Unclassified Sex',
              'Juvenile Males',
              'Juvenile Females',
              'Juveniles - Unclassified Sex',
              'Unknown Age/Sex',
              'Total Count',
              'Activity',
              'Feature Type',
              'Sign Type',
              'NonTargeted Observation Comments',
              'Photos'
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
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator
        },
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
          name: 'Easting',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Northing',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'GPS Datum',
          description: '',
          validations: GoatItems.gPSDatum
        },
        {
          name: 'Waypoint Elevation (m)',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Lat',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Long',
          description: '',
          validations: basicNumericValidator
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
              'Time',
              'Lat/Long Units',
              'Lat',
              'Long',
              'Location Comments'
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
          validations: basicNumericValidator
        },
        {
          name: 'Waypoint',
          description: '',
          validations: basicNumericValidator
        },

        {
          name: 'Observed',
          description: '',
          validations: GoatItems.basicYN
        },
        {
          name: 'With Young',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Collar Heard',
          description: '',
          validations: GoatItems.basicYNDidnt
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
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: [
          'Sampling Unit Summary',
          'Effort & Site Conditions',
          'Observations',
          'NonTargeted Observations',
          'UTM_LatLong',
          'Marked Animals'
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
