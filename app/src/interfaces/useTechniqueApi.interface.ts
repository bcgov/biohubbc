export interface ICreateTechniqueRequest {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
}

export interface ITechniqueResponse {
  method_technique_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
}
