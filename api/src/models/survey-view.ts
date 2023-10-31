import { Feature } from 'geojson';
import { SurveyMetadataPublish } from '../repositories/history-publish-repository';
import { IPermitModel } from '../repositories/permit-repository';
import { SiteSelectionData } from '../repositories/site-selection-strategy-repository';
import { SurveyBlockRecord } from '../repositories/survey-block-repository';
import { SurveyLocationRecord } from '../repositories/survey-location-repository';
import { SurveyUser } from '../repositories/survey-participation-repository';
import { SystemUser } from '../repositories/user-repository';

export type SurveyObject = {
  survey_details: GetSurveyData;
  species: GetFocalSpeciesData & GetAncillarySpeciesData;
  permit: GetPermitData;
  funding_sources: GetSurveyFundingSourceData[];
  purpose_and_methodology: GetSurveyPurposeAndMethodologyData;
  proprietor: GetSurveyProprietorData | null;
  locations: SurveyLocationRecord[];
  participants: (SurveyUser & SystemUser)[];
  partnerships: ISurveyPartnerships;
  site_selection: SiteSelectionData;
  blocks: SurveyBlockRecord[];
};

export interface ISurveyPartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

export class GetSurveyData {
  id: number;
  project_id: number;
  uuid: string;
  survey_name: string;
  start_date: string;
  end_date: string;
  survey_types: number[];
  revision_count: number;
  geometry: Feature[];

  constructor(obj?: any) {
    this.id = obj?.survey_id || null;
    this.project_id = obj?.project_id || null;
    this.uuid = obj?.uuid || null;
    this.survey_name = obj?.name || '';
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.geometry = (obj?.geojson?.length && obj.geojson) || [];
    this.survey_types = (obj?.survey_types?.length && obj.survey_types) || [];
    this.revision_count = obj?.revision_count || 0;
  }
}

export class GetSurveyFundingSourceData {
  survey_funding_source_id: number;
  survey_id: number;
  funding_source_id: number;
  amount: number;
  revision_count?: number;
  funding_source_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;

  constructor(obj?: any) {
    this.survey_funding_source_id = obj?.survey_funding_source_id || null;
    this.funding_source_id = obj?.funding_source_id || null;
    this.survey_id = obj?.survey_id || null;
    this.amount = obj?.amount || null;
    this.revision_count = obj?.revision_count || 0;
    this.funding_source_name = obj?.funding_source_name || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.description = obj?.description || null;
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
  permits: {
    permit_id: IPermitModel['permit_id'];
    permit_number: IPermitModel['number'];
    permit_type: IPermitModel['type'];
  }[];

  constructor(obj?: IPermitModel[]) {
    this.permits =
      obj?.map((item) => ({
        permit_id: item.permit_id,
        permit_number: item.number,
        permit_type: item.type
      })) ?? [];
  }
}

export class GetSurveyPurposeAndMethodologyData {
  intended_outcome_id: number;
  additional_details: string;
  revision_count: number;
  vantage_code_ids: number[];

  constructor(obj?: any) {
    this.intended_outcome_id = obj?.intended_outcome_id || null;
    this.additional_details = obj?.additional_details || '';
    this.vantage_code_ids = (obj?.vantage_ids?.length && obj.vantage_ids) || [];
    this.revision_count = obj?.revision_count ?? 0;
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
  survey_metadata_publish: SurveyMetadataPublish | null;
};

export class GetSurveyLocationData {
  survey_spatial_component_id: number;
  name: string;
  description: string;
  geojson: Feature[];
  revision_count: number;

  constructor(obj?: any) {
    this.survey_spatial_component_id = obj?.survey_spatial_component_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || null;
    this.geojson = (obj?.geojson?.length && obj.geojson) || [];
    this.revision_count = obj?.revision_count || 0;
  }
}

interface IGetAttachmentsSource {
  file_name: string;
  file_type: string;
  title: string;
  description: string;
  key: string;
  file_size: string;
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
            key: item.key,
            file_size: item.file_size
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
            key: item.key,
            file_size: item.file_size
          };

          if (item.authors?.length) {
            attachmentItem['authors'] = item.authors;
          }

          return attachmentItem;
        })) ||
      [];
  }
}
