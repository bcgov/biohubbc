import { CodeRepository, IAllCodeSets } from '../../repositories/code-repository';
import { CellObject } from '../xlsx-utils/column-validator-utils';

// TODO: This code column validation logic is specifically catered to the observation_signs code set, as
// it is the only code set currently being used in the observation CSVs, and is required. This logic will need to
// be updated to be more generic if other code sets are used in the future, or if they can be nullable.

/**
 * Returns SIMS code sets for any observation code columns (columns where the value is a code).
 *
 * @export
 * @param {CodeRepository} codeRepository
 * @return {*}  {Promise<{ OBSERVATION_SIGN: IAllCodeSets['observation_signs'] }>}
 */
export async function getCodeTypeDefinitions(
  codeRepository: CodeRepository
): Promise<{ OBSERVATION_SIGN: IAllCodeSets['observation_signs'] }> {
  const observation_signs = await codeRepository.getObservationSigns();

  return { OBSERVATION_SIGN: observation_signs };
}

/**
 * Checks if all passed in codes data is valid.
 * Returns false at first invalid code.
 *
 * @export
 * @param {CellObject[]} codesToValidate
 * @param {{ OBSERVATION_SIGN: IAllCodeSets['observation_signs'] }} codeTypeDefinitions
 * @return {*}  {boolean}
 */
export function validateCodes(
  codesToValidate: CellObject[],
  codeTypeDefinitions: { OBSERVATION_SIGN: IAllCodeSets['observation_signs'] }
): boolean {
  return codesToValidate.every((codeToValidate) => {
    if (!codeToValidate.cell) {
      // An empty value is valid
      return true;
    }

    const codeTypeDefinition = codeTypeDefinitions.OBSERVATION_SIGN;

    return isCodeValueValid(
      codeToValidate.cell.toLowerCase(),
      codeTypeDefinition.map((code) => code.name.toLowerCase())
    );
  });
}

/**
 * Checks if a code value is valid against the allowed values.
 *
 * @export
 * @param {string} cellValue
 * @param {string[]} allowedValues
 * @return {*}  {boolean}
 */
export function isCodeValueValid(cellValue: string, allowedValues: string[]): boolean {
  return allowedValues.includes(cellValue);
}
