import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-view');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey proprietor data
 *
 * @export
 * @class GetSurveyProprietorData
 */
export class GetSurveyProprietorData {
  proprietor_type_name: string;
  first_nations_name: string;
  category_rationale: string;
  proprietor_name: string;
  data_sharing_agreement_required: string;

  constructor(surveyProprietorData?: any) {
    defaultLog.debug({ label: 'GetSurveyProprietorData', message: 'params', surveyProprietorData });

    this.proprietor_type_name = surveyProprietorData?.proprietor_type_name || '';
    this.first_nations_name = surveyProprietorData?.first_nations_name || '';
    this.category_rationale = surveyProprietorData?.rationale || '';
    this.proprietor_name = surveyProprietorData?.proprietor_name || '';
    this.data_sharing_agreement_required = (surveyProprietorData?.data_sharing_agreement_required && 'true') || 'false';
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
            species: [survey.species]
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
