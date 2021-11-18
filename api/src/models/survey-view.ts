import { Feature } from 'geojson';
import moment from 'moment';
import { COMPLETION_STATUS } from '../constants/status';
import { getLogger } from '../utils/logger';

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
  survey_purpose: string;
  focal_species: (string | number)[];
  ancillary_species: (string | number)[];
  common_survey_methodology: string;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;
  permit_number: string;
  permit_type: string;
  funding_sources: any[];
  completion_status: string;
  publish_date: string;
  occurrence_submission_id: number;
  summary_results_submission_id: number;

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
    this.summary_results_submission_id = surveyDetailsData?.survey_summary_submission_id ?? null;
    this.survey_name = surveyDetailsData?.name || '';
    this.survey_purpose = surveyDetailsData?.objectives || '';
    this.focal_species = surveyDetailsData?.focal_species || [];
    this.ancillary_species = surveyDetailsData?.ancillary_species || [];
    this.start_date = surveyDetailsData?.start_date || '';
    this.end_date = surveyDetailsData?.end_date || '';
    this.biologist_first_name = surveyDetailsData?.lead_first_name || '';
    this.common_survey_methodology = surveyDetailsData?.common_survey_methodology || '';
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

/**
 * Pre-processes GET surveys list data
 *
 * @export
 * @class GetSurveyListData
 */
export class GetSurveyListData {
  surveys: any[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetSurveyListData', message: 'params', obj });

    const surveysList: any[] = [];
    const seenSurveyIds: number[] = [];

    obj &&
      obj.map((survey: any) => {
        if (!seenSurveyIds.includes(survey.id)) {
          surveysList.push({
            id: survey.id,
            name: survey.name,
            start_date: survey.start_date,
            end_date: survey.end_date,
            species: [survey.species],
            publish_timestamp: survey.publish_timestamp
          });
        } else {
          const index = surveysList.findIndex((item) => item.id === survey.id);
          surveysList[index].species = [...surveysList[index].species, survey.species];
        }

        seenSurveyIds.push(survey.id);
      });

    this.surveys = (surveysList.length && surveysList) || [];
  }
}

/**
 * Pre-processes GET survey funding sources list data
 *
 * @export
 * @class GetSurveyFundingSources
 */
export class GetSurveyFundingSources {
  fundingSources: any[];

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

    this.fundingSources = surveyFundingSourcesList;
  }
}
