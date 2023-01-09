export const basicNumericValidator = () => {
  return [
    {
      column_numeric_validator: {
        name: '',
        description: ''
      }
    }
  ];
};

export const basicDateValidator = () => {
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

export const basicRequiredValidator = () => {
  return [
    {
      column_format_validator: {
        reg_exp: '^(?!s*$).+',
        reg_exp_flags: 'g'
      }
    }
  ];
};
