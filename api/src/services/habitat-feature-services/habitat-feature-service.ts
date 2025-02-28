import { IDBConnection } from '../../database/db';
import { HabitatFeatureRepository } from '../../repositories/habitat-feature-repository/habitat-feature-repository';
import {
  FindHabitatFeatureDefinitionAdvancedFilters,
  FindHabitatFeatureDefinitions,
  FindHabitatFeatureQualitativeDefinition,
  FindHabitatFeatureQuantitativeDefinition
} from '../../repositories/habitat-feature-repository/habitat-feature-repository.interface';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';

/**
 * Service class for working with habitat feature records.
 *
 * @export
 * @class HabitatFeatureService
 * @extends {DBService}
 */
export class HabitatFeatureService extends DBService {
  habitatFeatureRepository: HabitatFeatureRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.habitatFeatureRepository = new HabitatFeatureRepository(connection);
  }

  /**
   * Find habitat feature quantitative definitions.
   *
   * @param {FindHabitatFeatureDefinitionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindHabitatFeatureQuantitativeDefinition[]>}
   * @memberof HabitatFeatureService
   */
  async findHabitatFeatureQuantitativeDefinitions(
    filterFields: FindHabitatFeatureDefinitionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindHabitatFeatureQuantitativeDefinition[]> {
    return this.habitatFeatureRepository.findHabitatFeatureQuantitativeDefinitions(filterFields, pagination);
  }

  /**
   * Find habitat feature qualitative definitions.
   *
   * @param {FindHabitatFeatureDefinitionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindHabitatFeatureQualitativeDefinition[]>}
   * @memberof HabitatFeatureService
   */
  async findHabitatFeatureQualitativeDefinitions(
    filterFields: FindHabitatFeatureDefinitionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindHabitatFeatureQualitativeDefinition[]> {
    return this.habitatFeatureRepository.findHabitatFeatureQualitativeDefinitions(filterFields, pagination);
  }

  /**
   * Find habitat feature definitions.
   *
   * @param {FindHabitatFeatureDefinitionAdvancedFilters} filterFields
   * @return {*}  {Promise<FindHabitatFeatureDefinitions>}
   * @memberof HabitatFeatureService
   */
  async findHabitatFeatureDefinitions(
    filterFields: FindHabitatFeatureDefinitionAdvancedFilters
  ): Promise<FindHabitatFeatureDefinitions> {
    return this.habitatFeatureRepository.findHabitatFeatureDefinitions(filterFields);
  }
}
