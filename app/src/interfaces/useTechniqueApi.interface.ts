import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';

export type QualitativeAttribute = {
  method_technique_attribute_qualitative_id: number | null;
  method_lookup_attribute_qualitative_id: string;
  method_lookup_attribute_qualitative_option_id: string;
};

export type QuantitativeAttribute = {
  method_technique_attribute_quantitative_id: number | null;
  method_lookup_attribute_quantitative_id: string;
  value: number;
};

export type TechniqueAttractant = {
  method_technique_attractant_id?: number;
  attractant_lookup_id: number;
};

export interface ICreateTechniqueRequest {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number | null;
  attractants: TechniqueAttractant[];
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
  attributes: {
    quantitative_attributes: QuantitativeAttribute[];
    qualitative_attributes: QualitativeAttribute[];
  };
  attractants: TechniqueAttractant[];
}

export interface ITechniqueResponse {
  techniques: IGetTechnique[];
  count: number;
}
