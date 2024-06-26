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
   * Get quantitative and qualitative attributes for a method lookup id.
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<IGetTechniqueAttributes[]>}
   * @memberof TechniqueAttributeService
   */
  async getAttributesForMethodLookupIds(methodLookupIds: number[]): Promise<IGetTechniqueAttributes[]> {
    return this.techniqueAttributeRepository.getAttributesForMethodLookupIds(methodLookupIds);
  }

  /**
   * Get quantitative and qualitative attributes for a technique id.
   *
   * @param {number} techniqueId
   * @return {*}  {Promise<ITechniqueAttributesObject>}
   * @memberof TechniqueAttributeService
   */
  async getAttributesByTechniqueId(techniqueId: number): Promise<ITechniqueAttributesObject> {
    return this.techniqueAttributeRepository.getAttributesByTechniqueId(techniqueId);
  }

  /**
   * Insert quantitative attributes for a technique.
   *
   * @param {number} techniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async insertQuantitativeAttributesForTechnique(
    techniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    this._validAttributesForTechnique(techniqueId, attributes);

    return this.techniqueAttributeRepository.insertQuantitativeAttributesForTechnique(techniqueId, attributes);
  }

  /**
   * Insert qualitative attributes for a technique.
   *
   * @param {number} techniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async insertQualitativeAttributesForTechnique(
    techniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    this._validAttributesForTechnique(techniqueId, attributes);

    return this.techniqueAttributeRepository.insertQualitativeAttributesForTechnique(techniqueId, attributes);
  }

  /**
   * Delete quantitative attributes for a technique.
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {number[]} methodLookupAttributeQuantitativeIds
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
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
   * Delete qualitative attributes for a technique.
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {number[]} methodLookupAttributeQualitativeIds
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
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
   * Update quantitative attributes for a technique.
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async updateDeleteQuantitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    this._validAttributesForTechnique(techniqueId, attributes);

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
   * Update qualitative attributes for a technique.
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async updateDeleteQualitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    this._validAttributesForTechnique(techniqueId, attributes);

    // Get existing attributes associated with the technique
    const techniqueAttributes = await this.techniqueAttributeRepository.getAttributesByTechniqueId(techniqueId);
    const existingAttributes = techniqueAttributes.qualitative_attributes;

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

  /**
   * Validate that the technique can have all incoming attributes. Throws an error if any attributes are invalid.
   *
   * @param {number} techniqueId
   * @param {((IQualitativeAttributePostData | IQuantitativeAttributePostData)[])} attributes
   * @return {*}  {Promise<void>}
   * @memberof TechniqueAttributeService
   */
  async _validAttributesForTechnique(
    techniqueId: number,
    attributes: (IQualitativeAttributePostData | IQuantitativeAttributePostData)[]
  ): Promise<void> {
    // Validate that the method lookup id can have the incoming attributes
    const allowedAttributes = await this.techniqueAttributeRepository.getAttributeDefinitionsByTechniqueId(techniqueId);

    const invalidAttributes = attributes.filter(
      (attribute) =>
        !allowedAttributes.qualitative_attributes.some(
          (allowedAttribute) =>
            'method_lookup_attribute_qualitative_id' in attribute &&
            allowedAttribute.method_lookup_attribute_qualitative_id === attribute.method_lookup_attribute_qualitative_id
        ) ||
        !allowedAttributes.qualitative_attributes.some(
          (allowedAttribute) =>
            'method_lookup_attribute_qualitative_id' in attribute &&
            allowedAttribute.method_lookup_attribute_qualitative_id === attribute.method_lookup_attribute_qualitative_id
        )
    );

    if (invalidAttributes.length > 0) {
      throw new Error('Invalid attributes for method_lookup_id');
    }
  }
}
