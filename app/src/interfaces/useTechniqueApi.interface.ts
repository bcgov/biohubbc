import { ApiPaginationResponseParams } from 'types/misc';
import { Vantage } from './useReferenceApi.interface';

export type TechniqueAttractant = {
  attractant_lookup_id: number;
};

export type TechniqueQualitativeAttribute = {
  method_technique_attribute_qualitative_id: number | null;
  method_lookup_attribute_qualitative_id: string;
  method_lookup_attribute_qualitative_option_id: string;
};

export type TechniqueQuantitativeAttribute = {
  method_technique_attribute_quantitative_id: number | null;
  method_lookup_attribute_quantitative_id: string;
  value: number;
};

type TechniqueVantageMethod = {
  vantage_category_id: number;
  vantage_method_id: number;
};

type PostVantage = Omit<Vantage, 'name' | 'vantage_category_id'>;

export interface ICreateTechniqueRequest {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  method_response_metric_id: number;
  attractants: TechniqueAttractant[];
  attributes: {
    qualitative_attributes: TechniqueQualitativeAttribute[];
    quantitative_attributes: TechniqueQuantitativeAttribute[];
  };
  vantage_methods: PostVantage[];
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
  method_response_metric_id: number;
  attractants: TechniqueAttractant[];
  attributes: {
    quantitative_attributes: TechniqueQuantitativeAttribute[];
    qualitative_attributes: TechniqueQualitativeAttribute[];
  };
  vantage_methods: Vantage[];
}

export interface IGetTechniquesResponse {
  techniques: IGetTechniqueResponse[];
  pagination: ApiPaginationResponseParams;
}

export type FindTechnique = {
  method_technique_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  method_lookup_name: string;
  method_response_metric_id: number;
  method_response_metric_name: string;
};

export type FindTechniques = {
  techniques: FindTechnique[];
  pagination: ApiPaginationResponseParams;
};
