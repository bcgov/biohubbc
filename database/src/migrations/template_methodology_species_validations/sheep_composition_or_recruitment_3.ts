import { SheepItems, basicNumericValidator, basicCodeVaildator } from './picklist_variables/v0.1';

export const sheepCompositionOrRecruitmentJSON = {
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
          validations: basicCodeVaildator(SheepItems.basicYN)
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
          name: 'Population Unit/Block Area (km2)',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Aircraft Type',
          description: '',
          validations: basicCodeVaildator(SheepItems.aircraftType)
        },
        {
          name: 'Light',
          description: '',
          validations: basicCodeVaildator(SheepItems.basicLight)
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
          validations: basicCodeVaildator(SheepItems.basicYN)
        },
        {
          name: 'With Young',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Collar Heard',
          description: '',
          validations: basicCodeVaildator(SheepItems.basicYNDidnt)
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
              'Collar Frequency',
              'GPS Unit Name',
              'Waypoint',
              'Observed',
              'With Young',
              'Collar Heard',
              'Best Heard Frequency',
              'Marked Animals Comments'
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
          validations: basicNumericValidator
        },
        {
          name: 'Species',
          description: '',
          validations: basicCodeVaildator(SheepItems.species)
        },

        {
          name: 'Ram - Class I',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Ram - Class II',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Ram - Class III',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Ram - Class IV',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Ram - Unclassified',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Ewes',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Yearling',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Lam (Young of Year)',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Ewe-Like Sheep',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Unclassified',
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
          validations: basicCodeVaildator(SheepItems.speciesSignType)
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: basicCodeVaildator(SheepItems.basicSignAge)
        },
        {
          name: 'Activity',
          description: '',
          validations: basicCodeVaildator(SheepItems.activityObservation)
        },
        {
          name: 'Elevation (m) of Observation',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: 'Habitat',
          description: '',
          validations: [
            {
              column_code_validator: {
                name: '',
                description: '',
                allowed_code_values: [
                  { name: 'Alpine' },
                  { name: 'Alpine Barren' },
                  { name: 'Alpine Heath Meadows' },
                  { name: 'Avalanche Path' },
                  { name: 'Broken Cliffs' },
                  { name: 'Broken Cliffs in Timber' },
                  { name: 'Burn' },
                  { name: 'Caves' },
                  { name: 'Clearout' },
                  { name: 'Cliff' },
                  { name: 'Cliff in Forest' },
                  { name: 'Coniferous' },
                  { name: 'Deciduous' },
                  { name: 'Dissected Cliffs' },
                  { name: 'Flat or Open Slopes' },
                  { name: 'Glacier' },
                  { name: 'Grass' },
                  { name: 'Krummholtz' },
                  { name: 'Mixed Wood' },
                  { name: 'Moraine' },
                  { name: 'Ridge' },
                  { name: 'Riparian' },
                  { name: 'Rock/Talus' },
                  { name: 'Scree' },
                  { name: 'Shrub' },
                  { name: 'Snow' },
                  { name: 'Sub-Alpine' },
                  { name: 'Talus/Slope' },
                  { name: 'Terraces' },
                  { name: 'Timber' },
                  { name: 'Wetland/Meadow' },
                  { name: 'Willow/Shrub' }
                ]
              }
            }
          ]
        },
        {
          name: 'Habitat - Slope',
          description: '',
          validations: basicCodeVaildator(SheepItems.habitatSlope)
        },
        {
          name: '% Veg Cover',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: '% Snow Cover',
          description: '',
          validations: basicNumericValidator
        },
        {
          name: '% Canopy Cover',
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
              'Population Unit',
              'Block ID/SU ID',
              'Date',
              'GPS Unit Name',
              'Waypoint',
              'Distance (m) and Bearing to Waypoint',
              'Species',
              'Ram - Class I',
              'Ram - Class II',
              'Ram - Class III',
              'Ram - Class IV',
              'Ram - Unclassified',
              'Ewes',
              'Yearling',
              'Lamb (Young of Year)',
              'Ewe-Like Sheep',
              'Unclassified',
              'Total Count',
              'Sign Type',
              'Age of Sign',
              'Activity',
              'Elevation (m) of Observation',
              'Habitat',
              'Habitat - Slope',
              '% Veg Cover',
              '% Snow Cover',
              '% Canopy Cover',
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
          validations: basicNumericValidator
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
          validations: basicCodeVaildator(SheepItems.activityNonTarget)
        },
        {
          name: 'Feature Type',
          description: '',
          validations: basicCodeVaildator(SheepItems.featureType)
        },
        {
          name: 'Sign Type',
          description: '',
          validations: basicCodeVaildator(SheepItems.basicSignType)
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
          validations: basicCodeVaildator(SheepItems.gPSDatum)
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
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: [
          'Sampling Unit Summary',
          'Effort & Site Conditions',
          'Marked Animals',
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
