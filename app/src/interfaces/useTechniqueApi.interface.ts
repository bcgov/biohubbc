import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';

export type QualitativeAttribute = {
  method_technique_attribute_qualitative_id: string;
  method_lookup_attribute_qualitative_option_id: string;
};

export type QuantitativeAttribute = {
  method_technique_attribute_quantitative_id: string;
  value: number;
};

export interface ICreateTechniqueRequest {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number | null;
  attractants: { attractant_lookup_id: number }[];
  attributes: {
    qualitative_attributes: QualitativeAttribute[];
    quantitative_attributes: QuantitativeAttribute[];
  };
}

/**
 * Technique attribute type.
 */
export type TechniqueAttributeType = ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative;

export interface IAttractant {
  attractant_lookup_id: number;
  name: string;
  description: string;
}

export interface IGetTechnique {
  method_technique_id: number;
  name: string;
  description: string | null;
  method_lookup_id: number;
  distance_threshold: number | null;
  quantitative_attributes: { method_technique_attribute_quantitative_id: string; value: number }[];
  qualitative_attributes: {
    method_technique_attribute_qualitative_id: string;
    method_lookup_attribute_qualitative_option_id: string;
  }[];
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniqueResponse {
  techniques: IGetTechnique[];
  count: number;
}
