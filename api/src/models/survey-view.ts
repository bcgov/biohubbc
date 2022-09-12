import { Feature } from 'geojson';

export type SurveyObject = {
  survey_details: GetSurveyData;
  species: GetFocalSpeciesData & GetAncillarySpeciesData;
  permit: GetPermitData;
  purpose_and_methodology: GetSurveyPurposeAndMethodologyData;
  funding: GetSurveyFundingSources;
  proprietor: GetSurveyProprietorData | null;
  location: GetSurveyLocationData;
  attachments?: GetAttachmentsData;
  report_attachments?: GetReportAttachmentsData;
};

export class GetSurveyData {
  id: number;
  uuid: string;
  survey_name: string;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;

  constructor(obj?: any) {
    this.id = obj?.survey_id || null;
    this.uuid = obj?.uuid || null;
    this.survey_name = obj?.name || '';
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.geometry = (obj?.geojson?.length && obj.geojson) || [];
    this.biologist_first_name = obj?.lead_first_name || '';
    this.biologist_last_name = obj?.lead_last_name || '';
    this.survey_area_name = obj?.location_name || '';
    this.revision_count = obj?.revision_count || 0;
  }
}

export class GetFocalSpeciesData {
  focal_species: number[];
  focal_species_names: string[];

  constructor(obj?: any[]) {
    this.focal_species = [];
    this.focal_species_names = [];

    obj?.length &&
      obj.forEach((item: any) => {
        this.focal_species.push(Number(item.id));
        this.focal_species_names.push(item.label);
      });
  }
}

export class GetAncillarySpeciesData {
  ancillary_species: number[];
  ancillary_species_names: string[];

  constructor(obj?: any[]) {
    this.ancillary_species = [];
    this.ancillary_species_names = [];

    obj?.length &&
      obj.forEach((item: any) => {
        this.ancillary_species.push(Number(item.id));
        this.ancillary_species_names.push(item.label);
      });
  }
}
export class GetPermitData {
  permit_number: number;
  permit_type: string;

  constructor(obj?: any) {
    this.permit_number = obj?.number || '';
    this.permit_type = obj?.type || '';
  }
}

export class GetSurveyPurposeAndMethodologyData {
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  revision_count: number;
  vantage_code_ids: number[];
  surveyed_all_areas: string;

  constructor(obj?: any) {
    this.intended_outcome_id = obj?.intended_outcome_id || null;
    this.additional_details = obj?.additional_details || null;
    this.field_method_id = obj?.field_method_id || null;
    this.ecological_season_id = obj?.ecological_season_id || null;
    this.vantage_code_ids = (obj?.vantage_ids?.length && obj.vantage_ids) || [];
    this.surveyed_all_areas = (obj?.surveyed_all_areas && 'true') || 'false';
    this.revision_count = obj?.revision_count ?? 0;
  }
}

interface IGetSurveyFundingSource {
  pfs_id: number;
  funding_amount: number;
  funding_source_id: number;
  funding_start_date: string;
  funding_end_date: string;
  investment_action_category_id: number;
  investment_action_category_name: string;
  agency_name: string;
  funding_source_project_id: string;
}

export class GetSurveyFundingSources {
  funding_sources: IGetSurveyFundingSource[];

  constructor(obj?: any[]) {
    this.funding_sources =
      (obj &&
        obj.map((item: any) => {
          return {
            pfs_id: item.project_funding_source_id,
            funding_amount: item.funding_amount,
            funding_source_id: item.funding_source_id,
            funding_start_date: item.funding_start_date,
            funding_end_date: item.funding_end_date,
            investment_action_category_id: item.investment_action_category_id,
            investment_action_category_name: item.investment_action_category_name,
            agency_name: item.agency_name,
            funding_source_project_id: item.funding_source_project_id
          };
        })) ||
      [];
  }
}

export class GetSurveyProprietorData {
  proprietor_type_name: string;
  proprietor_type_id: number;
  first_nations_name: string;
  first_nations_id: number;
  category_rationale: string;
  proprietor_name: string;
  disa_required: boolean;

  constructor(obj?: any) {
    this.proprietor_type_name = obj?.proprietor_type_name || null;
    this.proprietor_type_id = obj?.proprietor_type_id || null;
    this.first_nations_name = obj?.first_nations_name || null;
    this.first_nations_id = obj?.first_nations_id || null;
    this.category_rationale = obj?.category_rationale || null;
    this.proprietor_name = obj?.proprietor_name || null;
    this.disa_required = obj?.disa_required || false;
  }
}

export type SurveySupplementaryData = {
  occurrence_submission: number;
  summary_result: number;
};

export class GetSurveyLocationData {
  survey_area_name: string;
  geometry: Feature[];

  constructor(obj?: any) {
    this.survey_area_name = obj?.location_name || '';
    this.geometry = (obj?.geojson?.length && obj.geojson) || [];
  }
}

interface IGetAttachmentsSource {
  file_name: string;
  file_type: string;
  title: string;
  description: string;
  key: string;
  file_size: string;
  is_secure: string;
}

/**
 * Pre-processes GET /surveys/{id} attachments data
 *
 * @export
 * @class GetAttachmentsData
 */
export class GetAttachmentsData {
  attachmentDetails: IGetAttachmentsSource[];

  constructor(attachments?: any[]) {
    this.attachmentDetails =
      (attachments?.length &&
        attachments.map((item: any) => {
          return {
            file_name: item.file_name,
            file_type: item.file_type,
            title: item.title,
            description: item.description,
            key: item.security_token ? '' : item.key,
            file_size: item.file_size,
            is_secure: item.security_token ? 'true' : 'false'
          };
        })) ||
      [];
  }
}

interface IGetReportAttachmentsSource {
  file_name: string;
  title: string;
  year: string;
  description: string;
  key: string;
  file_size: string;
  is_secure: string;
  authors?: { author: string }[];
}

/**
 * Pre-processes GET /surveys/{id} report attachments data
 *
 * @export
 * @class GetReportAttachmentsData
 */
export class GetReportAttachmentsData {
  attachmentDetails: IGetReportAttachmentsSource[];

  constructor(attachments?: any[]) {
    this.attachmentDetails =
      (attachments?.length &&
        attachments.map((item: any) => {
          const attachmentItem = {
            file_name: item.file_name,
            title: item.title,
            year: item.year,
            description: item.description,
            key: item.security_token ? '' : item.key,
            file_size: item.file_size,
            is_secure: item.security_token ? 'true' : 'false'
          };

          if (item.authors.length) {
            attachmentItem['authors'] = { author: item.authors };
          }

          return attachmentItem;
        })) ||
      [];
  }
}
