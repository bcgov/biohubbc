import { IDBConnection } from '../database/db';
import {
  IGetTechniqueAttributes,
  IQualitativeAttributePostData,
  IQuantitativeAttributePostData,
  ITechniqueAttributesObject,
  TechniqueAttributeRepository
} from '../repositories/technique-attribute-repository';
import { DBService } from './db-service';

export class TechniqueAttributeService extends DBService {
  techniqueAttributeRepository: TechniqueAttributeRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueAttributeRepository = new TechniqueAttributeRepository(connection);
  }

  /**
   * Lookup quantitative and qualitative attributes for a method lookup Id
   *
   * @param {number[]} method_lookup_ids
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getAttributesForMethodLookupIds(method_lookup_ids: number[]): Promise<IGetTechniqueAttributes[]> {
    return this.techniqueAttributeRepository.getAttributesForMethodLookupIds(method_lookup_ids);
  }

  /**
   * Lookup quantitative and qualitative attributes for a method lookup Id
   *
   * @param {number} techniqueId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getAttributesByTechniqueId(techniqueId: number): Promise<ITechniqueAttributesObject> {
    return this.techniqueAttributeRepository.getAttributesByTechniqueId(techniqueId);
  }

  /**
   * Insert quantitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {number[]} attributes
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async insertQuantitativeAttributesForTechnique(
    techniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<void> {
    return this.techniqueAttributeRepository.insertQuantitativeAttributesForTechnique(techniqueId, attributes);
  }

  /**
   * Insert qualitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async insertQualitativeAttributesForTechnique(
    techniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<void> {
    return this.techniqueAttributeRepository.insertQualitativeAttributesForTechnique(techniqueId, attributes);
  }

  /**
   * Delete quantitative attributes for a technique
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {number[]} methodLookupAttributeQuantitativeIds
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async deleteQuantitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    methodLookupAttributeQuantitativeIds: number[]
  ): Promise<void> {
    return this.techniqueAttributeRepository.deleteQuantitativeAttributesForTechnique(
      surveyId,
      techniqueId,
      methodLookupAttributeQuantitativeIds
    );
  }

  /**
   * Delete qualitative attributes for a technique
   *
   *  @param {number} surveyId
   * @param {number} techniqueId
   * @param {number[]} methodLookupAttributeQualitativeIds
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async deleteQualitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    methodLookupAttributeQualitativeIds: number[]
  ): Promise<void> {
    return this.techniqueAttributeRepository.deleteQualitativeAttributesForTechnique(
      surveyId,
      techniqueId,
      methodLookupAttributeQualitativeIds
    );
  }

  /**
   * Update quantitative attributes for a technique
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async updateDeleteQuantitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<void> {
    // Get existing attributes associated with the technique
    const techniqueAttributes = await this.techniqueAttributeRepository.getAttributesByTechniqueId(techniqueId);
    const existingAttributes = techniqueAttributes.quantitative_attributes;

    // Find existing attributes to delete
    const attributesToDelete = existingAttributes.filter(
      (existing) =>
        !attributes.some(
          (incoming) =>
            incoming.method_technique_attribute_quantitative_id === existing.method_technique_attribute_quantitative_id
        )
    );

    // Delete existing attributes that are not in the new list
    if (attributesToDelete.length > 0) {
      const attributeIdsToDelete = attributesToDelete.map(
        (attribute) => attribute.method_technique_attribute_quantitative_id
      );
      
      await this.techniqueAttributeRepository.deleteQuantitativeAttributesForTechnique(
        surveyId,
        techniqueId,
        attributeIdsToDelete
      );
    }

    // If the incoming data does not have method_technique_attractant_id, record is for insert
    const attributesForInsert = attributes.filter((attribute) => !attribute.method_technique_attribute_quantitative_id);

    if (attributesForInsert.length > 0) {
      await this.techniqueAttributeRepository.insertQuantitativeAttributesForTechnique(
        techniqueId,
        attributesForInsert
      );
    }

    // If the incoming data does have method_technique_attractant_id, record is for update
    const attributesForUpdate = attributes.filter((attribute) => attribute.method_technique_attribute_quantitative_id);

    const promises = [];

    if (attributesForUpdate.length > 0) {
      promises.push(
        attributesForUpdate.map((attribute) =>
          this.techniqueAttributeRepository.updateQuantitativeAttributeForTechnique(techniqueId, attribute)
        )
      );
    }

    await Promise.all(promises);
  }

  /**
   * Update qualitative attributes for a technique
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param { IQualitativeAttributePostData[]} attributes
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async updateDeleteQualitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<void> {
    // Get existing attributes associated with the technique
    const techniqueAttributes = await this.techniqueAttributeRepository.getAttributesByTechniqueId(techniqueId);
    const existingAttributes = techniqueAttributes.qualitative_attributes;

    console.log('here')
    console.log(techniqueAttributes)

    // Find existing attributes to delete
    const attributesToDelete = existingAttributes.filter(
      (existing) =>
        !attributes.some(
          (incoming) =>
            incoming.method_technique_attribute_qualitative_id === existing.method_technique_attribute_qualitative_id
        )
    );

    // Delete existing attributes that are not in the new list
    if (attributesToDelete.length > 0) {
      const attributeIdsToDelete = attributesToDelete.map(
        (attribute) => attribute.method_technique_attribute_qualitative_id
      );

      await this.techniqueAttributeRepository.deleteQualitativeAttributesForTechnique(
        surveyId,
        techniqueId,
        attributeIdsToDelete
      );
    }

    // If the incoming data does not have method_technique_attractant_id, record is for insert
    const attributesForInsert = attributes.filter((attribute) => !attribute.method_technique_attribute_qualitative_id);

    if (attributesForInsert.length > 0) {
      await this.techniqueAttributeRepository.insertQualitativeAttributesForTechnique(techniqueId, attributesForInsert);
    }

    // If the incoming data does have method_technique_attractant_id, record is for update
    const attributesForUpdate = attributes.filter((attribute) => attribute.method_technique_attribute_qualitative_id);

    const promises = [];

    if (attributesForUpdate.length > 0) {
      promises.push(
        attributesForUpdate.map((attribute) =>
          this.techniqueAttributeRepository.updateQualitativeAttributeForTechnique(techniqueId, attribute)
        )
      );
    }

    await Promise.all(promises);
  }
}
