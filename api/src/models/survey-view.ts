import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-view');

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
