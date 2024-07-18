import { IDBConnection } from '../database/db';
import {
  IQualitativeAttributePostData,
  IQuantitativeAttributePostData,
  TechniqueAttributeRepository,
  TechniqueAttributesLookupObject,
  TechniqueAttributesObject
} from '../repositories/technique-attribute-repository';
import { DBService } from './db-service';

/**
 * Service layer for technique attributes.
 *
 * @export
 * @class TechniqueAttributeService
 * @extends {DBService}
 */
export class TechniqueAttributeService extends DBService {
  techniqueAttributeRepository: TechniqueAttributeRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueAttributeRepository = new TechniqueAttributeRepository(connection);
  }

  /**
   * Get quantitative and qualitative attribute definition records for method lookup ids.
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<TechniqueAttributesLookupObject[]>}
   * @memberof TechniqueAttributeService
   */
  async getAttributeDefinitionsByMethodLookupIds(
    methodLookupIds: number[]
  ): Promise<TechniqueAttributesLookupObject[]> {
    return this.techniqueAttributeRepository.getAttributeDefinitionsByMethodLookupIds(methodLookupIds);
  }

  /**
   * Get quantitative and qualitative attribute records for a technique id.
   *
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<TechniqueAttributesObject>}
   * @memberof TechniqueAttributeService
   */
  async getAttributesByTechniqueId(methodTechniqueId: number): Promise<TechniqueAttributesObject> {
    return this.techniqueAttributeRepository.getAttributesByTechniqueId(methodTechniqueId);
  }

  /**
   * Insert quantitative attribute records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @return {*}  {(Promise<{ method_technique_attribute_quantitative_id: number }[] | undefined>)}
   * @memberof TechniqueAttributeService
   */
  async insertQuantitativeAttributesForTechnique(
    methodTechniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<{ method_technique_attribute_quantitative_id: number }[] | undefined> {
    // Validate that the method lookup id can have the incoming attributes
    await this._areAttributesValidForTechnique(methodTechniqueId, attributes);

    return this.techniqueAttributeRepository.insertQuantitativeAttributesForTechnique(methodTechniqueId, attributes);
  }

  /**
   * Insert qualitative attribute records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @return {*}  {(Promise<{ method_technique_attribute_qualitative_id: number }[] | undefined>)}
   * @memberof TechniqueAttributeService
   */
  async insertQualitativeAttributesForTechnique(
    methodTechniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<{ method_technique_attribute_qualitative_id: number }[] | undefined> {
    // Validate that the method lookup id can have the incoming attributes
    await this._areAttributesValidForTechnique(methodTechniqueId, attributes);

    return this.techniqueAttributeRepository.insertQualitativeAttributesForTechnique(methodTechniqueId, attributes);
  }

  /**
   * Delete quantitative attribute records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {number[]} methodLookupAttributeQuantitativeIds
   * @return {*}  {Promise<{ method_technique_attribute_quantitative_id: number }[]>}
   * @memberof TechniqueAttributeService
   */
  async deleteQuantitativeAttributesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    methodLookupAttributeQuantitativeIds: number[]
  ): Promise<{ method_technique_attribute_quantitative_id: number }[]> {
    return this.techniqueAttributeRepository.deleteQuantitativeAttributesForTechnique(
      surveyId,
      methodTechniqueId,
      methodLookupAttributeQuantitativeIds
    );
  }

  /**
   * Delete qualitative attribute records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {number[]} methodLookupAttributeQualitativeIds
   * @return {*}  {Promise<{ method_technique_attribute_qualitative_id: number }[]>}
   * @memberof TechniqueAttributeService
   */
  async deleteQualitativeAttributesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    methodLookupAttributeQualitativeIds: number[]
  ): Promise<{ method_technique_attribute_qualitative_id: number }[]> {
    return this.techniqueAttributeRepository.deleteQualitativeAttributesForTechnique(
      surveyId,
      methodTechniqueId,
      methodLookupAttributeQualitativeIds
    );
  }

  /**
   * Delete all quantitative and qualitative attribute records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<{
   *     qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
   *     quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
   *   }>}
   * @memberof TechniqueAttributeService
   */
  async deleteAllTechniqueAttributes(
    surveyId: number,
    methodTechniqueId: number
  ): Promise<{
    qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
    quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  }> {
    return this.techniqueAttributeRepository.deleteAllTechniqueAttributes(surveyId, methodTechniqueId);
  }

  /**
   * Update quantitative attribute records for a technique.
   *
   * Inserts new records, updates existing records, and deletes records that are not in the incoming list.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async insertUpdateDeleteQuantitativeAttributesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    await this._areAttributesValidForTechnique(methodTechniqueId, attributes);

    // Get existing attributes associated with the technique
    const allTechniqueAttributes = await this.techniqueAttributeRepository.getAttributesByTechniqueId(
      methodTechniqueId
    );
    const existingQuantitativeAttributes = allTechniqueAttributes.quantitative_attributes;

    // Find existing attributes to delete
    const attributesToDelete = existingQuantitativeAttributes.filter(
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
        methodTechniqueId,
        attributeIdsToDelete
      );
    }

    // If the incoming data does not have method_technique_attribute_quantitative_id, record is for insert
    const attributesForInsert = attributes.filter((attribute) => !attribute.method_technique_attribute_quantitative_id);

    if (attributesForInsert.length > 0) {
      await this.techniqueAttributeRepository.insertQuantitativeAttributesForTechnique(
        methodTechniqueId,
        attributesForInsert
      );
    }

    // If the incoming data does have method_technique_attribute_quantitative_id, record is for update
    const attributesForUpdate = attributes.filter((attribute) => attribute.method_technique_attribute_quantitative_id);

    const promises = [];

    if (attributesForUpdate.length > 0) {
      promises.push(
        attributesForUpdate.map((attribute) =>
          this.techniqueAttributeRepository.updateQuantitativeAttributeForTechnique(methodTechniqueId, attribute)
        )
      );
    }

    await Promise.all(promises);
  }

  /**
   * Update qualitative attribute records for a technique.
   *
   * Inserts new records, updates existing records, and deletes records that are not in the incoming list.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async insertUpdateDeleteQualitativeAttributesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    await this._areAttributesValidForTechnique(methodTechniqueId, attributes);

    // Get existing attributes associated with the technique
    const techniqueAttributes = await this.techniqueAttributeRepository.getAttributesByTechniqueId(methodTechniqueId);
    const existingQualitativeAttributes = techniqueAttributes.qualitative_attributes;

    // Find existing attributes to delete
    const attributesToDelete = existingQualitativeAttributes.filter(
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
        methodTechniqueId,
        attributeIdsToDelete
      );
    }

    // If the incoming data does not have method_technique_attribute_qualitative_id, record is for insert
    const attributesForInsert = attributes.filter((attribute) => !attribute.method_technique_attribute_qualitative_id);

    if (attributesForInsert.length > 0) {
      await this.techniqueAttributeRepository.insertQualitativeAttributesForTechnique(
        methodTechniqueId,
        attributesForInsert
      );
    }

    // If the incoming data does have method_technique_attribute_qualitative_id, record is for update
    const attributesForUpdate = attributes.filter((attribute) => attribute.method_technique_attribute_qualitative_id);

    const promises = [];

    if (attributesForUpdate.length > 0) {
      promises.push(
        attributesForUpdate.map((attribute) =>
          this.techniqueAttributeRepository.updateQualitativeAttributeForTechnique(methodTechniqueId, attribute)
        )
      );
    }

    await Promise.all(promises);
  }

  /**
   * Validate that the incoming attributes are valid for the provided method lookup id.
   *
   * @param {number} methodTechniqueId The method technique id used to fetch the allowed attributes, against which
   * the incoming attributes will be validated.
   * @param {((IQualitativeAttributePostData | IQuantitativeAttributePostData)[])} incomingAttributes The incoming
   * attributes to validate against the reference data in the database.
   * @return {*}  {Promise<void>}
   * @throws {Error} If any of the incoming attributes are not valid for the provided method lookup id.
   * @memberof TechniqueAttributeService
   */
  async _areAttributesValidForTechnique(
    methodTechniqueId: number,
    incomingAttributes: (IQualitativeAttributePostData | IQuantitativeAttributePostData)[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    const validAttributes = await this.techniqueAttributeRepository.getAttributeDefinitionsByTechniqueId(
      methodTechniqueId
    );

    for (const incomingAttribute of incomingAttributes) {
      if ('method_lookup_attribute_quantitative_id' in incomingAttribute) {
        if (
          !validAttributes.quantitative_attributes.some(
            (allowedAttribute) =>
              allowedAttribute.method_lookup_attribute_quantitative_id ===
              incomingAttribute.method_lookup_attribute_quantitative_id
          )
        ) {
          throw new Error('Invalid attributes for method_lookup_id');
        }
      } else if ('method_lookup_attribute_qualitative_id' in incomingAttribute) {
        if (
          !validAttributes.qualitative_attributes.some(
            (allowedAttribute) =>
              allowedAttribute.method_lookup_attribute_qualitative_id ===
              incomingAttribute.method_lookup_attribute_qualitative_id
          )
        ) {
          throw new Error('Invalid attributes for method_lookup_id');
        }
      }
    }
  }
}
