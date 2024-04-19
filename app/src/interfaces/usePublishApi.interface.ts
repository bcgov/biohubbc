import { IGetProjectAttachment, IGetProjectReportAttachment } from './useProjectApi.interface';

export interface IProjectSubmitForm {
  reports: IGetProjectReportAttachment[];
  attachments: IGetProjectAttachment[];
}
