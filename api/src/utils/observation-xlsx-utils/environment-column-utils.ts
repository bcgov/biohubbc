import {
  EnvironmentType,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../repositories/observation-subcount-environment-repository';
import { ObservationSubCountEnvironmentService } from '../../services/observation-subcount-environment-service';
// import { getLogger } from '../logger';
import { isQualitativeValueValid, isQuantitativeValueValid } from './common-utils';

export type EnvironmentColumnNameTypeDefinitionMap = Map<
  string,
  QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
>;

export interface IEnvironmentDataToValidate {
  key: string;
  value: string | number;
}

// const defaultLog = getLogger('src/utils/observation-xlsx-utils/environment-column-utils');

/**
 * Given an array of column headers, returns an array of column headers that have a corresponding environment type
 * definitions.
 *
 * @export
 * @param {string[]} columns
 * @param {EnvironmentType} environments
 * @return {*}
 */
export function getEnvironmentColumnNames(columns: string[], environments: EnvironmentType) {
  // Filter out columns that have no corresponding environment type definition
  return columns.filter((column) => {
    return (
      environments.qualitative_environments.some((item) => String(item.environment_qualitative_id) === column) ||
      environments.quantitative_environments.some((item) => String(item.environment_quantitative_id) === column)
    );
  });
}

export async function getEnvironmentTypeDefinitionsFromColumnNames(
  columnNames: string[],
  observationSubCountEnvironmentService: ObservationSubCountEnvironmentService
): Promise<EnvironmentType> {
  const [qualitative_environments, quantitative_environments] = await Promise.all([
    observationSubCountEnvironmentService.findQualitativeEnvironmentTypeDefinitions(columnNames),
    observationSubCountEnvironmentService.findQuantitativeEnvironmentTypeDefinitions(columnNames)
  ]);

  return { qualitative_environments, quantitative_environments };
}

export function getEnvironmentColumnsTypeDefinitionMap(
  environmentColumns: string[],
  environmentTypeDefinitions: EnvironmentType
): EnvironmentColumnNameTypeDefinitionMap {
  const columnNameDefinitionMap = new Map<
    string,
    QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
  >();

  // Map column names to their respective environment type definitions
  for (const columnName of environmentColumns) {
    const qualitativeEnvironment = environmentTypeDefinitions.qualitative_environments.find(
      (item) => item.name.toLowerCase() === columnName.toLowerCase()
    );
    if (qualitativeEnvironment) {
      columnNameDefinitionMap.set(columnName, qualitativeEnvironment);
      continue;
    }

    const quantitativeEnvironment = environmentTypeDefinitions.quantitative_environments.find(
      (item) => item.name.toLowerCase() === columnName.toLowerCase()
    );
    if (quantitativeEnvironment) {
      columnNameDefinitionMap.set(columnName, quantitativeEnvironment);
      continue;
    }
  }

  return columnNameDefinitionMap;
}

/**
 * Checks if all passed in environment data is valid.
 * Returns false at first invalid environment.
 *
 * @export
 * @param {IEnvironmentDataToValidate[]} environmentsToValidate
 * @param {EnvironmentColumnNameTypeDefinitionMap} environmentColumnNameTypeDefinitionMap
 * @return {*}  {boolean}
 */
export function validateCsvEnvironmentColumns(
  environmentsToValidate: IEnvironmentDataToValidate[],
  environmentColumnNameTypeDefinitionMap: EnvironmentColumnNameTypeDefinitionMap
): boolean {
  return environmentsToValidate.every((environmentToValidate) => {
    if (!environmentToValidate.value) {
      // An empty value is valid

      return true;
    }

    const environmentDefinition = environmentColumnNameTypeDefinitionMap.get(environmentToValidate.key);

    if (!environmentDefinition) {
      // Collumn name does not match any environment definition. The incoming data is invalid.

      return false;
    }

    if (isEnvironmentQualitativeTypeDefinition(environmentDefinition)) {
      return isQualitativeValueValid(
        String(environmentToValidate.value),
        environmentDefinition.options.map((option) => option.name)
      );
    }

    return isQuantitativeValueValid(
      Number(environmentToValidate.value),
      environmentDefinition.min,
      environmentDefinition.max
    );
  });
}

/**
 * Type guard to check if a given item is a `QualitativeEnvironmentTypeDefinition`.
 *
 * Qualitative environments have an `options` property, while quantitative environments do not.
 *
 * @export
 * @param {(QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition)} item
 * @return {*}  {item is QualitativeEnvironmentTypeDefinition}
 */
export function isEnvironmentQualitativeTypeDefinition(
  item: QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
): item is QualitativeEnvironmentTypeDefinition {
  return 'options' in item;
}
