import Ajv, { ErrorObject } from 'ajv';

export interface IValidationResult {
  isValid: boolean;
  errors: ErrorObject[] | null | undefined;
}

/**
 * Validate that a JSON-Schema template conforms to the JSON-Schema specification.
 *
 * See: https://json-schema.org/
 *
 * @export
 * @param {object} jsonSchema
 * @return {boolean} true if the template is valid, false otherwise
 */
export function isValidJSONSchema(jsonSchema: object): IValidationResult {
  const ajv = new Ajv();

  const isValid = ajv.validateSchema(jsonSchema);

  return { isValid, errors: ajv.errors };
}

/**
 * Validate that a JSON object conforms to a JSON-Schema template.
 *
 * @export
 * @param {object} jsonObject
 * @param {object} jsonSchema
 * @return {boolean} true if the template is valid, false otherwise
 */
export function isJSONObjectValidForJSONSchema(jsonObject: object, jsonSchema: object): IValidationResult {
  const ajv = new Ajv({ allErrors: true });

  const isValidSchema = ajv.validate(jsonSchema, jsonObject);

  return { isValid: isValidSchema as boolean, errors: ajv.errors };
}
