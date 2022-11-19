export enum SUMMARY_TEMPLATE_NAME {
  MOOSE_SUMMARY_RESULTS = 'Moose Summary Results Template',
  SHEEP_SUMMARY_RESULTS = 'Sheep Summary Results Template',
  GOAT_SUMMARY_RESULTS = 'Goat Summary Results Template',
  ELK_SUMMARY_RESULTS = 'Elk Summary Results Template'
}

export const summaryTemplateValidationJson = {
  name: '',
  description: '',
  defaultFile: {
    description: '',
    columns: [
      {
        name: 'Observed',
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
        name: 'Estimated',
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
        name: 'Sightability Correction Factor',
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
        name: 'SE',
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
        name: 'Coefficient of Variation (%)',
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
        name: 'Confidence Level (%)',
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
        name: 'Area Flown (km2)',
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
        name: 'Total Survey Area (km2)',
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
        name: 'Total Kilometers Surveyed (km)',
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
        name: 'Best Parameter Value Flag',
        description: '',
        validations: [
          {
            column_code_validator: {
              name: '',
              description: '',
              allowed_code_values: [
                { name: 'Yes', description: '' },
                { name: 'No', description: '' },
                { name: 'Unknown', description: '' },
                { name: 'Not Evaluated', description: '' }
              ]
            }
          }
        ]
      },
      {
        name: 'Total Marked Animals Observed',
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
        name: 'Marked Animals Available',
        description: '',
        validations: [
          {
            column_numeric_validator: {
              name: '',
              description: ''
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
            'Population Unit',
            'Block/Sample Unit',
            'Parameter',
            'Stratum',
            'Observed',
            'Estimated',
            'Sightability Model',
            'Sightability Correction Factor',
            'SE',
            'Coefficient of Variation (%)',
            'Confidence Level (%)',
            'Lower CL',
            'Upper CL',
            'Total Survey Area (km2)',
            'Area Flown (km2)',
            'Total Kilometers Surveyed (km)',
            'Best Parameter Value Flag',
            'Outlier Blocks Removed',
            'Total Marked Animals Observed',
            'Marked Animals Available',
            'Parameter Comments'
          ]
        }
      }
    ]
  },
  validations: [
    {
      mimetype_validator: {
        reg_exps: ['text\\/csv', 'application\\/vnd.*']
      }
    }
  ]
};
