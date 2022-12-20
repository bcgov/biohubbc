const fs = require('fs');

const basicNumericValidator = () => {
  return [
    {
      column_numeric_validator: {
        name: '',
        description: ''
      }
    }
  ];
};

const basicDateValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
        reg_exp_flags: 'g',
        expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
      }
    }
  ];
};

const basicRequiredValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^(?!s*$).+',
        reg_exp_flags: 'g',
        expected_format: 'This '
      }
    }
  ];
};

const starterObject = {
  name: '',
  description: '',
  files: [
    {
      name: '',
      description: '',
      validations: [],
      columns: [
        {
          name: '',
          description: '',
          validations: []
        }
      ]
    }
  ],
  validations: []
};

// Moose Aerial SRB Recruitment Composition Survey
const mooseArialSRBRecruitmentCompositionSurvey = {
  name: '',
  description: '',
  files: [
    {
      name: 'Block Summary',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area', 'Block ID/SU ID', 'Stratum']
          }
        },
        {
          file_column_unique_validator: {
            column_names: ['Study Area', 'Block ID/SU ID', 'Stratum']
          }
        }
      ],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'Stratum',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Observations',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area', 'Block ID/SU ID', 'Stratum', 'Date', 'Species']
          }
        },
        {
          file_column_unique_validator: {
            column_names: ['Study Area', 'Block ID/SU ID', 'Stratum']
          }
        }
      ],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
                reg_exp_flags: 'g',
                expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
              }
            }
          ]
        },
        {
          name: 'Time',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: [] //TODO What is valid here?
        },
        {
          name: 'Spike/Fork Bulls',
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
          name: '3 Brow/10 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Yearling Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class III Bulls',
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
          name: 'Cow',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Calves',
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
          name: 'Sign Type',
          description: '',
          validations: []
        },
        {
          name: 'Sign Count',
          description: '',
          validations: []
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: []
        },
        {
          name: 'Veg Cover (%)',
          description: '',
          validations: []
        },
        {
          name: 'Snow Cover (%)',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      columns: [
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
                reg_exp_flags: 'g',
                expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
              }
            }
          ]
        },
        {
          name: 'Wildlife Health ID',
          description: '',
          validations: []
        },
        {
          name: 'Animal ID',
          description: '',
          validations: []
        },
        {
          name: 'Telemetry Device ID',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
                reg_exp_flags: 'g',
                expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
              }
            }
          ]
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: []
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
      validations: []
    },
    {
      name: 'Effort & Site Conditions',
      description: '',
      columns: [],
      validations: [
        {
          file_duplicate_columns_validator: {}
        }
      ]
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: [
          'Block Summary',
          'Effort & Site Conditions',
          'Observations',
          'Marked Animals',
          'Incidental Observations'
        ]
      }
    }
  ]
};

const mooseArialGeneralRecruitmentCompositionSurvey = {
  name: '',
  description: '',
  files: [
    {
      name: 'Effort & Site Conditions',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'Block Area (km2)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Start Time 1',
          description: '',
          validations: []
        },
        {
          name: 'End Time 1',
          description: '',
          validations: []
        },
        {
          name: 'Start Time 2',
          description: '',
          validations: []
        },
        {
          name: 'End Time 2',
          description: '',
          validations: []
        },
        {
          name: 'Start Time 3',
          description: '',
          validations: []
        },
        {
          name: 'End Time 3',
          description: '',
          validations: []
        },
        {
          name: 'Total Block Time',
          description: '',
          validations: []
        },
        {
          name: 'Total Time (hours)',
          description: '',
          validations: []
        },
        {
          name: 'Total Time (mins)',
          description: '',
          validations: []
        },
        {
          name: 'Time (mins)/block area (km2)',
          description: '',
          validations: []
        },
        {
          name: 'Aircraft Type',
          description: '',
          validations: []
        },
        {
          name: 'Pilot',
          description: '',
          validations: []
        },
        {
          name: 'Navigator',
          description: '',
          validations: []
        },
        {
          name: 'Rear Left Observer',
          description: '',
          validations: []
        },
        {
          name: 'Rear Right Observer',
          description: '',
          validations: []
        },
        {
          name: 'Temperature',
          description: '',
          validations: []
        },
        {
          name: 'Visibility',
          description: '',
          validations: []
        },
        {
          name: 'Cloud Cover',
          description: '',
          validations: []
        },
        {
          name: 'Wind Speed',
          description: '',
          validations: []
        },
        {
          name: 'Precipitation',
          description: '',
          validations: []
        },
        {
          name: 'Light',
          description: '',
          validations: []
        },
        {
          name: 'Snow cover',
          description: '',
          validations: []
        },
        {
          name: 'Snow Depth ',
          description: '',
          validations: []
        },
        {
          name: 'Days Since Snowfall',
          description: '',
          validations: []
        },
        {
          name: 'Weather Description',
          description: '',
          validations: []
        },
        {
          name: 'Habitat Description',
          description: '',
          validations: []
        },
        {
          name: 'Effort & Site Comments',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Observations',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area', 'Block ID/SU ID', 'Date', 'Species']
          }
        },
        {
          file_column_unique_validator: {
            column_names: ['Study Area', 'Block ID/SU ID', 'Stratum']
          }
        }
      ],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: basicRequiredValidator()
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: [
            {
              column_format_validator: {
                reg_exp: '^d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$',
                reg_exp_flags: 'g',
                expected_format: 'Dates need to be formatted in YYYY-MM-DD. For example: 2020-09-15.'
              }
            }
          ]
        },
        {
          name: 'Time',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: [] //TODO What is valid here?
        },
        {
          name: 'Spike/ Fork Bulls',
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
          name: '3 Brow/10 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Yearling Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class III Bulls',
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
          name: 'Cow',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Calves',
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
          name: 'Sign Type',
          description: '',
          validations: []
        },
        {
          name: 'Sign Count',
          description: '',
          validations: []
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: []
        },
        {
          name: 'Veg Cover (%)',
          description: '',
          validations: []
        },
        {
          name: 'Snow Cover (%)',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        },
        {
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: []
        },
        {
          name: 'Wildlife Health ID',
          description: '',
          validations: []
        },
        {
          name: 'Animal ID',
          description: '',
          validations: []
        },
        {
          name: 'Telemetry Device ID',
          description: '',
          validations: []
        },
        {
          name: 'Collar/Tag Frequency',
          description: '',
          validations: []
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: []
        },
        {
          name: 'Right Ear Tag ID',
          description: '',
          validations: []
        },
        {
          name: 'Right Ear Tag Colour',
          description: '',
          validations: []
        },
        {
          name: 'Left Ear Tag ID',
          description: '',
          validations: []
        },
        {
          name: 'Left Ear Tag Colour',
          description: '',
          validations: []
        },
        {
          name: 'Marked Animals Comments',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        },
        {
          name: 'Time',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: []
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
          name: 'Species Occurrence Status',
          description: '',
          validations: []
        },
        {
          name: 'Activity',
          description: '',
          validations: []
        },
        {
          name: 'Activity Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Feature Type',
          description: '',
          validations: []
        },
        {
          name: 'FEature Type Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Type',
          description: '',
          validations: []
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Photos',
          description: '',
          validations: []
        },
        {
          name: 'Incidental Observation Comments',
          description: '',
          validations: []
        }
      ]
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: ['Effort & Site Conditions', 'Observations', 'Marked Animals', 'Incidental Observations']
      }
    }
  ]
};

const mooseArialTransectDistanceSamplingSurvey = {
  name: '',
  description: '',
  files: [
    {
      name: 'Effort & Site Conditions',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        }
      ]
    },
    {
      name: 'Observation',
      description: '',
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {
            required_columns: ['Study Area', 'Block ID/SU ID', 'Date', 'Species']
          }
        },
        {
          file_column_unique_validator: {
            column_names: ['Study Area', 'Block ID/SU ID', 'Stratum']
          }
        }
      ],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: basicRequiredValidator()
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'UTM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Perpendicular Distance From Transect Line (m)',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        },
        {
          name: 'Time',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: [] //TODO What is valid here?
        },
        {
          name: 'Spike/ Fork Bulls',
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
          name: '3 Brow/10 Point Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Yearling Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class I Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class II Bulls',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'BC RISC Class III Bulls',
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
          name: 'Cow',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Calves',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Adult Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Bulls - Unclassified',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unclassified Age/Sex',
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
          name: 'Sign Type',
          description: '',
          validations: []
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Age of Sign',
          description: '',
          validations: []
        },
        {
          name: 'Veg Cover (%)',
          description: '',
          validations: []
        },
        {
          name: 'Snow Cover (%)',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Marked Animals',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Group Label',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        },
        {
          name: 'Targeted or Non-Targeted',
          description: '',
          validations: []
        },
        {
          name: 'Wildlife Health ID',
          description: '',
          validations: []
        },
        {
          name: 'Animal ID',
          description: '',
          validations: []
        },
        {
          name: 'Telemetry Device ID',
          description: '',
          validations: []
        },
        {
          name: 'Collar/Tag Frequency',
          description: '',
          validations: []
        },
        {
          name: 'Frequency Unit',
          description: '',
          validations: []
        },
        {
          name: 'Right Ear Tag ID',
          description: '',
          validations: []
        },
        {
          name: 'Right Ear Tag Colour',
          description: '',
          validations: []
        },
        {
          name: 'Left Ear Tag ID',
          description: '',
          validations: []
        },
        {
          name: 'Left Ear Tag Colour',
          description: '',
          validations: []
        },
        {
          name: 'Marked Animals Comments',
          description: '',
          validations: []
        }
      ]
    },
    {
      name: 'Incidental Observations',
      description: '',
      validations: [],
      columns: [
        {
          name: 'Study Area',
          description: '',
          validations: []
        },
        {
          name: 'Block ID/SU ID',
          description: '',
          validations: []
        },
        {
          name: 'Transect ID',
          description: '',
          validations: []
        },
        {
          name: 'Date',
          description: '',
          validations: basicDateValidator()
        },
        {
          name: 'URM Zone',
          description: '',
          validations: []
        },
        {
          name: 'Easting',
          description: '',
          validations: []
        },
        {
          name: 'Northing',
          description: '',
          validations: []
        },
        {
          name: 'Datum',
          description: '',
          validations: []
        },
        {
          name: 'Lat (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Long (DD)',
          description: '',
          validations: []
        },
        {
          name: 'Species',
          description: '',
          validations: []
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
          name: 'Juvenile - Unclassified Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Unknown Age/Sex',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Species Occurrence Status',
          description: '',
          validations: []
        },
        {
          name: 'Activity',
          description: '',
          validations: []
        },
        {
          name: 'Activity Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Feature Type',
          description: '',
          validations: []
        },
        {
          name: 'Feature Type Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Sign Type',
          description: '',
          validations: []
        },
        {
          name: 'Sign Count',
          description: '',
          validations: basicNumericValidator()
        },
        {
          name: 'Photos',
          description: '',
          validations: []
        },
        {
          name: 'Incidental Observation Comments',
          description: '',
          validations: []
        }
      ]
    }
  ],
  validations: [
    {
      submission_required_files_validator: {
        required_files: ['Effort & Site Conditions', 'Observations', 'Marked Animals', 'Incidental Observations']
      }
    }
  ],
  workbookValidations: [
    {
      workbook_parent_child_key_match_validator: {
        parent_worksheet_name: 'Observations',
        child_worksheet_name: 'Marked Animals',
        column_names: ['Group Label']
      }
    }
  ]
};

fs.writeFile('./template.json', JSON.stringify(mooseArialTransectDistanceSamplingSurvey), (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully

  console.log('All done!');
});
// console.log(JSON.stringify(mooseArialSRBRecruitmentCompositionSurvey));
