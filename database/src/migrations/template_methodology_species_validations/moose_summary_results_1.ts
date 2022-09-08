import { basicCodeValidator, basicNumericValidator, MooseSummaryItems } from "./picklist_variables/v0.2";

export const mooseSummary = {
    name: '',
    description: '',
    files: [
        {
            name: 'Moose_RESULTS',
            description: '',
            columns: [
                {
                  name: 'Parameter', 
                  description: '',
                  validations: basicCodeValidator(MooseSummaryItems.parameter)
                },
                {
                  name: 'Observed',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Estimated',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Sightability Model', 
                  description: '',
                  validations: basicCodeValidator(MooseSummaryItems.sightabilityModel)
                },
                {
                  name: 'Stratum',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Sightability Correction Factor', 
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'SE', 
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Coefficient of Variation (%)',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Confidence Level (%)',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Area Flown (km2)',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Total Suvey Area (km2)',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Total Kilometers Surveyed (km)',
                  description: '',
                  validations: basicNumericValidator()
                },
                {
                  name: 'Best Parameter Value Flag', 
                  description: '',
                  validations: basicCodeValidator(MooseSummaryItems.bestParameterValueFlag)
                },
                {
                  name: 'Total Marked Animals Observed',
                  description: '',
                  validations: basicNumericValidator()
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
                },
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
                            'Coefficient of Varation (%)',
                            'Confidence Level (%)',
                            'Lower CL',
                            'Upper CL',
                            'Total Survey Area (km2)',
                            'Area Flown (km2)',
                            'Total Kilometers Survey (km)',
                            'Best Parameter Value Flag',
                            'Outlier Blocks Removed',
                            'Total Marked Animals Observed',
                            'Marked Animals Available',
                            'Parameter Comments'
                        ]
                    }
                }
            ]
        }
    ],
    validations: [
        {
            submission_required_files_validator: {
                required_files: ['Moose_RESULTS']
            }
        },
        {
            mimetype_validator: {
                reg_exp: ['application\\.vnd.*']
            }
        }
    ]
}