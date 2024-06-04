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
  method_lookup_id: number;
  distance_threshold: number | null;
  quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniqueResponse {
  techniques: IGetTechnique[];
  count: number;
}
