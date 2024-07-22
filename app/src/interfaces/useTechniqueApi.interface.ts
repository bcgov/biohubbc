import { ApiPaginationResponseParams } from 'types/misc';

export type TechniqueAttractant = {
  attractant_lookup_id: number;
};

type TechniqueQualitativeAttribute = {
  method_technique_attribute_qualitative_id: number | null;
  method_lookup_attribute_qualitative_id: string;
  method_lookup_attribute_qualitative_option_id: string;
};

type TechniqueQuantitativeAttribute = {
  method_technique_attribute_quantitative_id: number | null;
  method_lookup_attribute_quantitative_id: string;
  value: number;
};

export interface ICreateTechniqueRequest {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number | null;
  attractants: TechniqueAttractant[];
  attributes: {
    qualitative_attributes: TechniqueQualitativeAttribute[];
    quantitative_attributes: TechniqueQuantitativeAttribute[];
  };
}

export interface IUpdateTechniqueRequest extends ICreateTechniqueRequest {
  method_technique_id: number;
}

export interface IGetTechniqueResponse {
  method_technique_id: number;
  name: string;
  description: string | null;
  method_lookup_id: number;
  distance_threshold: number | null;
  attractants: TechniqueAttractant[];
  attributes: {
    quantitative_attributes: TechniqueQuantitativeAttribute[];
    qualitative_attributes: TechniqueQualitativeAttribute[];
  };
}

export interface IGetTechniquesResponse {
  techniques: IGetTechniqueResponse[];
  count: number;
  pagination: ApiPaginationResponseParams;
}
