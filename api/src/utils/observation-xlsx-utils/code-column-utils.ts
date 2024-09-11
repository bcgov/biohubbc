import { CodeRepository, IAllCodeSets } from '../../repositories/code-repository';
import { CellObject } from '../xlsx-utils/column-validator-utils';

// TODO: This code column validation logic is specifically catered to the observation_subcount_signs code set, as
// it is the only code set currently being used in the observation CSVs, and is required. This logic will need to
// be updated to be more generic if other code sets are used in the future, or if they can be nullable.

/**
 * Given a list of column names, fetches the environment type definitions for each column (if the column has a matching
 * environment type definition).
 *
 * @export
 * @param {string[]} columnNames
 * @param {ObservationSubCountEnvironmentService} observationSubCountEnvironmentService
 * @return {*}  {Promise<EnvironmentType>}
 */
/**
 * Returns SIMS code sets for any observation code columns (columns where the value is a code).
 *
 * @export
 * @param {CodeRepository} codeRepository
 * @return {*}  {Promise<{ OBSERVATION_SUBCOUNT_SIGN: IAllCodeSets['observation_subcount_signs'] }>}
 */
export async function getCodeTypeDefinitions(
  codeRepository: CodeRepository
): Promise<{ OBSERVATION_SUBCOUNT_SIGN: IAllCodeSets['observation_subcount_signs'] }> {
  const observation_subcount_signs = await codeRepository.getObservationSubcountSigns();

  return { OBSERVATION_SUBCOUNT_SIGN: observation_subcount_signs };
}

/**
 * Checks if all passed in codes data is valid.
 * Returns false at first invalid code.
 *
 * @export
 * @param {CellObject[]} codesToValidate
 * @param {{ OBSERVATION_SUBCOUNT_SIGN: IAllCodeSets['observation_subcount_signs'] }} codeTypeDefinitions
 * @return {*}  {boolean}
 */
export function validateCodes(
  codesToValidate: CellObject[],
  codeTypeDefinitions: { OBSERVATION_SUBCOUNT_SIGN: IAllCodeSets['observation_subcount_signs'] }
): boolean {
  return codesToValidate.every((codeToValidate) => {
    if (!codeToValidate.cell) {
      // An empty value is valid
      return true;
    }

    const codeTypeDefinition = codeTypeDefinitions.OBSERVATION_SUBCOUNT_SIGN;

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
