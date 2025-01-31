/**
 * Technique quantitative attributes
 */
export interface ITechniqueAttributeQuantitative {
  method_lookup_attribute_quantitative_id: string;
  name: string;
  description: string | null;
  unit: string | null;
  min: number | null;
  max: number | null;
}

/**
 * Technique qualitative attributes
 */
export interface ITechniqueAttributeQualitativeOption {
  method_lookup_attribute_qualitative_option_id: string;
  name: string;
  description: string | null;
}

/**
 * Technique qualitative attributes
 */
export interface ITechniqueAttributeQualitative {
  method_lookup_attribute_qualitative_id: string;
  name: string;
  description: string | null;
  options: ITechniqueAttributeQualitativeOption[];
}

/**
 * Response for fetching technique attributes for a method lookup id
 */
export interface IGetTechniqueAttributes {
  method_lookup_id: number;
  quantitative_attributes: ITechniqueAttributeQuantitative[];
  qualitative_attributes: ITechniqueAttributeQualitative[];
}
