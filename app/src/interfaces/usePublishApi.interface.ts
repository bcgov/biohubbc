import { ISurveyObservationData } from './useDwcaApi.interface';
import { IGetProjectAttachment, IGetProjectReportAttachment } from './useProjectApi.interface';
import { ISurveySummaryData } from './useSummaryResultsApi.interface';
import { IGetSurveyAttachment, IGetSurveyReportAttachment } from './useSurveyApi.interface';

export interface IProjectSubmitForm {
  reports: IGetProjectReportAttachment[];
  attachments: IGetProjectAttachment[];
}

export interface ISurveySubmitForm {
  observations: ISurveyObservationData[];
  summary: ISurveySummaryData[];
  reports: IGetSurveyReportAttachment[];
  attachments: IGetSurveyAttachment[];
}
