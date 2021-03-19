import { FormValidation } from '@rjsf/core';
import jsonpatch from 'fast-json-patch';
import traverse from 'json-schema-traverse';
import moment from 'moment';

export enum X_DATE_RANGE_VALIDATOR {
  OBJ = 'x-date-range-validator',
  START = 'start',
  END = 'end'
}

type rjsfValidator = (formData: any, errors: FormValidation) => FormValidation;

/**
 * Returns an RJSF compliant custom validator.
 *
 * When this validator is triggered by the RJSF form, it iterates over and runs each item in the original `validators`
 * param.
 *
 * @export
 * @param {rjsfValidator[]} validators an array of RJSF compliant validators to run each time the form validation is
 * triggered.
 * @return {*}  {rjsfValidator} an RJSF compliant custom validator
 */
export const getCustomValidator = (validators: rjsfValidator[]): rjsfValidator => {
  return (formData: any, errors: FormValidation): FormValidation => {
    for (const validator of validators) {
      errors = validator(formData, errors);
    }

    return errors;
  };
};

/**
 * A custom RJSF validator for date ranges, that adds errors if the start date is after the end date.
 *
 * @param {string} jsonPointerToStartDate a json pointer to the start date value in the form data
 * @param {string} jsonPointerToToEndDate a json pointer to the end date value in the form data
 * @return {*}  {rjsfValidator} an RJSF compliant custom validator
 */
export const getDateRangeValidator = (
  jsonPointerToStartDate: string,
  jsonPointerToToEndDate: string
): rjsfValidator => {
  return (formData: any, errors: FormValidation): FormValidation => {
    const startDate = jsonpatch.getValueByPointer(formData, jsonPointerToStartDate);
    const endDate = jsonpatch.getValueByPointer(formData, jsonPointerToToEndDate);

    if (!startDate || !endDate) {
      // if either date is null then there is nothing to compare
      return errors;
    }

    // if start date is after end date (which implies end date is also before start date), then add an error
    if (moment(startDate).isAfter(moment(endDate))) {
      // Clear any existing errors for the date fields
      jsonpatch.applyPatch(errors, [{ op: 'replace', path: `${jsonPointerToStartDate}/__errors`, value: [] }]);
      jsonpatch.applyPatch(errors, [{ op: 'replace', path: `${jsonPointerToToEndDate}/__errors`, value: [] }]);

      // Add new errors indicating that the date range is invalid
      jsonpatch.getValueByPointer(errors, jsonPointerToStartDate).addError('Start date must come before end date');
      jsonpatch.getValueByPointer(errors, jsonPointerToToEndDate).addError('End date must come after start date');
    }

    return errors;
  };
};

/**
 * Parses the template.ui_template for any custom validator tags, and returns an array of RJSF compliant validators.
 *
 * @param {ITemplate} template
 * @return {*}  {rjsfValidator[]} an array of RJSF compliant custom validators
 */
export const autoParseCustomValidators = (template: any): rjsfValidator[] => {
  let validators: rjsfValidator[] = [];

  if (!template || !template.ui_template) {
    return validators;
  }

  traverse(template.ui_template, {
    allKeys: true,
    cb: (schema: object, jsonPtr: string) => {
      // Add any date range validators
      if (Object.keys(schema).includes(X_DATE_RANGE_VALIDATOR.OBJ)) {
        const jsonPointerToStartDate = `${jsonPtr}/${schema[X_DATE_RANGE_VALIDATOR.OBJ][X_DATE_RANGE_VALIDATOR.START]}`;
        const jsonPointerToToEndDate = `${jsonPtr}/${schema[X_DATE_RANGE_VALIDATOR.OBJ][X_DATE_RANGE_VALIDATOR.END]}`;

        validators.push(getDateRangeValidator(jsonPointerToStartDate, jsonPointerToToEndDate));
      }
    }
  });

  return validators;
};
