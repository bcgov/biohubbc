import { Feature } from 'geojson';
import moment from 'moment';
import { COMPLETION_STATUS } from '../constants/status';
import { getLogger } from '../utils/logger';
import { GetSurveyPurposeAndMethodologyData } from './survey-view-update';

const defaultLog = getLogger('models/survey-view');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey details data for view
 *
 * @export
 * @class GetViewSurveyDetailsData
 */
export class GetViewSurveyDetailsData {
  id: number;
  survey_name: string;
  focal_species: number[];
  focal_species_names: string[];
  ancillary_species: number[];
  ancillary_species_names: string[];
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;
  permit_number: string;
  permit_type: string;
  funding_sources: object[];
  completion_status: string;
  publish_date: string;
  occurrence_submission_id: number;

  constructor(surveyDetailsData?: any) {
    defaultLog.debug({
      label: 'GetViewSurveyDetailsData',
      message: 'params',
      surveyDetailsData: {
        ...surveyDetailsData,
        geometry: surveyDetailsData?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    this.id = surveyDetailsData?.id ?? null;
    this.occurrence_submission_id = surveyDetailsData?.occurrence_submission_id ?? null;
    this.survey_name = surveyDetailsData?.name || '';
    this.focal_species = surveyDetailsData?.focal_species || [];
    this.focal_species_names = surveyDetailsData?.focal_species_names || [];
    this.ancillary_species = surveyDetailsData?.ancillary_species || [];
    this.ancillary_species_names = surveyDetailsData?.ancillary_species_names || [];
    this.start_date = surveyDetailsData?.start_date || '';
    this.end_date = surveyDetailsData?.end_date || '';
    this.biologist_first_name = surveyDetailsData?.lead_first_name || '';
    this.biologist_last_name = surveyDetailsData?.lead_last_name || '';
    this.survey_area_name = surveyDetailsData?.location_name || '';
    this.geometry = (surveyDetailsData?.geometry?.length && surveyDetailsData.geometry) || [];
    this.permit_number = surveyDetailsData?.number || '';
    this.permit_type = surveyDetailsData?.type || '';
    this.funding_sources = surveyDetailsData?.funding_sources || [];
    this.revision_count = surveyDetailsData?.revision_count ?? null;
    this.completion_status =
      (surveyDetailsData &&
        surveyDetailsData.end_date &&
        moment(surveyDetailsData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
    this.publish_date = surveyDetailsData?.publish_date || '';
  }
}

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
          pfsId: fundingSource.id,
          amount: fundingSource.funding_amount,
          startDate: fundingSource.start_date,
          endDate: fundingSource.end_date,
          agencyName: fundingSource.agency_name
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

export type SurveyObject = {
  survey: GetSurveyData;
  species: GetSpeciesData;
  permit: GetPermitData;
  purposeAndMethodology: GetSurveyPurposeAndMethodologyData;
  funding_sources: any[];
  proprietorData: any;
};

export class GetSurveyData {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  publish_status: string;
  completion_status: number;

  constructor(surveyData?: any) {
    this.id = surveyData?.survey_id || null;
    this.name = surveyData?.name || '';
    this.start_date = surveyData?.start_date || null;
    this.end_date = surveyData?.end_date || null;
    this.publish_status = surveyData?.publish_timestamp ? 'Published' : 'Unpublished';
    this.completion_status =
      (surveyData.end_date &&
        moment(surveyData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
  }
}
