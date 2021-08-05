import { Feature } from 'geojson';
import moment from 'moment';
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

  constructor(surveyDetailsData?: any) {
    defaultLog.debug({ label: 'GetViewSurveyDetailsData', message: 'params', surveyDetailsData });

    const surveyDataItem = surveyDetailsData && surveyDetailsData.length && surveyDetailsData[0];

    const focalSpeciesList: string[] = [];
    const seenFocalSpecies: string[] = [];

    const ancillarySpeciesList: string[] = [];
    const seenAncillarySpecies: string[] = [];

    const fundingSourcesList: any[] = [];
    const seenFundingSourceIds: number[] = [];

    surveyDetailsData &&
      surveyDetailsData.map((item: any) => {
        if (!seenFundingSourceIds.includes(item.pfs_id) && item.pfs_id) {
          fundingSourcesList.push({
            agency_name: item.agency_name,
            pfs_id: item.pfs_id,
            funding_amount: item.funding_amount,
            funding_start_date: item.funding_start_date,
            funding_end_date: item.funding_end_date
          });
        }
        seenFundingSourceIds.push(item.pfs_id);

        if (!seenFocalSpecies.includes(item.focal_species)) {
          focalSpeciesList.push(item.focal_species);
        }
        seenFocalSpecies.push(item.focal_species);

        if (!seenAncillarySpecies.includes(item.ancillary_species)) {
          ancillarySpeciesList.push(item.ancillary_species);
        }
        seenAncillarySpecies.push(item.ancillary_species);
      });

    this.id = surveyDataItem?.id ?? null;
    this.survey_name = surveyDataItem?.name || '';
    this.survey_purpose = surveyDataItem?.objectives || '';
    this.focal_species = (focalSpeciesList.length && focalSpeciesList.filter((item: string | number) => !!item)) || [];
    this.ancillary_species =
      (ancillarySpeciesList.length && ancillarySpeciesList.filter((item: string | number) => !!item)) || [];
    this.start_date = surveyDataItem?.start_date || '';
    this.end_date = surveyDataItem?.end_date || '';
    this.biologist_first_name = surveyDataItem?.lead_first_name || '';
    this.biologist_last_name = surveyDataItem?.lead_last_name || '';
    this.survey_area_name = surveyDataItem?.location_name || '';
    this.geometry = (surveyDataItem?.geometry?.length && [JSON.parse(surveyDataItem.geometry)]) || [];
    this.permit_number = surveyDataItem?.number || '';
    this.permit_type = surveyDataItem?.type || '';
    this.funding_sources = (fundingSourcesList.length && fundingSourcesList.filter((item: any) => !!item)) || [];
    this.revision_count = surveyDataItem?.revision_count ?? null;
    this.completion_status =
      (surveyDataItem &&
        surveyDataItem.end_date &&
        moment(surveyDataItem.end_date).endOf('day').isBefore(moment()) &&
        'Completed') ||
      'Active';
    this.publish_date = surveyDataItem?.publish_date || '';
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
