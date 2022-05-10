import { Feature } from 'geojson';
import moment from 'moment';
import { COMPLETION_STATUS } from '../constants/status';
import { getLogger } from '../utils/logger';
import { GetSurveyPurposeAndMethodologyData } from './survey-view-update';

const defaultLog = getLogger('models/survey-view');

export class GetSpeciesData {
  species: number[];
  species_names: string[];

  constructor(input?: any[]) {
    this.species = [];
    this.species_names = [];
    input?.length &&
      input.forEach((item: any) => {
        this.species.push(Number(item.id));
        this.species_names.push(item.label);
      });
  }
}

export class GetPermitData {
  permit_number: number;
  permit_type: string;

  constructor(input?: any) {
    this.permit_number = input?.number ?? null;
    this.permit_type = input?.type ?? null;
  }
}

/**
 * Pre-processes GET survey funding sources list data
 *
 * @export
 * @class GetSurveyFundingSources
 */
export class GetSurveyFundingSources {
  funding_sources: any[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetSurveyFundingSources', message: 'params', obj });

    const surveyFundingSourcesList: any[] = [];

    obj &&
      obj.map((fundingSource: any) => {
        surveyFundingSourcesList.push({
          pfs_id: fundingSource.id,
          funding_amount: fundingSource.funding_amount,
          funding_start_date: fundingSource.start_date,
          funding_end_date: fundingSource.end_date,
          agency_name: fundingSource.agency_name
        });
      });

    this.funding_sources = surveyFundingSourcesList;
  }
}

export class GetFocalSpeciesData {
  focal_species: number[];
  focal_species_names: string[];

  constructor(input?: any[]) {
    this.focal_species = [];
    this.focal_species_names = [];

    input?.length &&
      input.forEach((item: any) => {
        this.focal_species.push(Number(item.id));
        this.focal_species_names.push(item.label);
      });
  }
}

export class ParsedSpeciesIds {
  focal_species: string[];
  ancillary_species: string[];

  constructor(input?: any[]) {
    this.focal_species = [];
    this.ancillary_species = [];

    input?.length &&
      input.forEach((item: any) => {
        if (!item.is_focal) {
          this.ancillary_species.push(item.wldtaxonomic_units_id);
        } else {
          this.focal_species.push(item.wldtaxonomic_units_id);
        }
      });
  }
}

export type SurveyObject = {
  survey_details: GetSurveyData;
  species: GetFocalSpeciesData & GetAncillarySpeciesData;
  permit: GetPermitData;
  purpose_and_methodology: GetSurveyPurposeAndMethodologyData;
  funding_sources: any[];
  proprietor: any;
  occurrence_submission: number;
  summary_result: number;
};

export class GetSurveyData {
  id: number;
  survey_name: string;
  start_date: string;
  end_date: string;
  publish_date: string;
  publish_status: string;
  completion_status: number;
  geometry: Feature[];
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;

  constructor(surveyData?: any) {
    this.id = surveyData?.survey_id || null;
    this.survey_name = surveyData?.name || '';
    this.start_date = surveyData?.start_date || null;
    this.end_date = surveyData?.end_date || null;
    this.publish_date = String(surveyData?.publish_date || '');
    this.publish_status = surveyData?.publish_timestamp ? 'Published' : 'Unpublished';
    this.completion_status =
      (surveyData.end_date &&
        moment(surveyData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
    this.geometry = (surveyData?.geojson?.length && surveyData.geojson) || [];
    this.biologist_first_name = surveyData?.lead_first_name || '';
    this.biologist_last_name = surveyData?.lead_last_name || '';
    this.survey_area_name = surveyData?.location_name || '';
  }
}

export class GetAncillarySpeciesData {
  ancillary_species: number[];
  ancillary_species_names: string[];

  constructor(input?: any[]) {
    this.ancillary_species = [];
    this.ancillary_species_names = [];

    input?.length &&
      input.forEach((item: any) => {
        this.ancillary_species.push(Number(item.id));
        this.ancillary_species_names.push(item.label);
      });
  }
}
