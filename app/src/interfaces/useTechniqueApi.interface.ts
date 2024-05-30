export interface ICreateTechniqueRequest {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number | null;
  attractants: number[];
  attributes: { attribute_id: string, type: string }[];
}

export interface IAttractant {
  attractant_lookup_id: number;
  name: string;
  description: string;
}

export interface IGetTechnique {
  method_technique_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  quantitative_attributes: { method_technique_attribute_quantitative_id: string; value: number }[];
  qualitative_attributes: {
    method_technique_attribute_qualitative_id: string;
    method_technique_attribute_qualitative_option_id: string;
  }[];
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniqueResponse {
  techniques: IGetTechnique[];
  count: number;
}
