import {
  EnvironmentType,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../repositories/observation-subcount-environment-repository';
import { ObservationSubCountEnvironmentService } from '../../services/observation-subcount-environment-service';
import { isQualitativeValueValid, isQuantitativeValueValid } from './common-utils';

export type EnvironmentNameTypeDefinitionMap = Map<
  string,
  QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
>;

export interface IEnvironmentDataToValidate {
  key: string;
  value: string | number;
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
): EnvironmentNameTypeDefinitionMap {
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
 * @param {EnvironmentNameTypeDefinitionMap} environmentNameTypeDefinitionMap
 * @return {*}  {boolean}
 */
export function validateEnvironments(
  environmentsToValidate: IEnvironmentDataToValidate[],
  environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap
): boolean {
  return environmentsToValidate.every((environmentToValidate) => {
    if (!environmentToValidate.value) {
      // An empty value is valid
      return true;
    }

    const environmentDefinition = environmentNameTypeDefinitionMap.get(environmentToValidate.key);

    if (!environmentDefinition) {
      // Column name does not match any environment definition. The incoming data is invalid.
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
