const fs = require('fs');
/*
// helper functions for constructing validation schema
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
*/
const templateValidationSchema = {};

fs.writeFile('./template.json', JSON.stringify(templateValidationSchema), (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully

  console.log('All done!');
});
// console.log(JSON.stringify(mooseArialSRBRecruitmentCompositionSurvey));
