import { AttachmentType } from 'constants/attachments';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React } from 'react';
import ProjectAttachmentDialog from './project/attachment/ProjectAttachmentDialog';
import ProjectReportAttachmentDialog from './project/report/ProjectReportAttachmentDialog';
import SurveyAttachmentDialog from './survey/SurveyAttachmentDialog';
import SurveyReportAttachmentDialog from './survey/SurveyReportAttachmentDialog';

export interface IAttachmentTypeSelectorProps {
  projectId: number;
  surveyId?: number;
  currentAttachment: IGetProjectAttachment | IGetSurveyAttachment | null;
  open: boolean;
  close: () => void;
  refresh: (id: number, type: string) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const AttachmentTypeSelector: React.FC<IAttachmentTypeSelectorProps> = (props) => {
  if (!props.open) {
    return <></>;
  }

  const instanceOfIGetProjectAttachment = (object: any): object is IGetProjectAttachment => {
    return true;
  };

  const instanceOfIGetSurveyAttachment = (object: any): object is IGetSurveyAttachment => {
    return true;
  };

  return (
    <>
      {props.surveyId && instanceOfIGetSurveyAttachment(props.currentAttachment) && (
        <>
          {props.currentAttachment?.fileType === AttachmentType.REPORT && (
            <SurveyReportAttachmentDialog
              projectId={props.projectId}
              surveyId={props.surveyId}
              attachmentId={props.currentAttachment?.id}
              currentAttachment={props.currentAttachment}
              dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
              open={props.open}
              onClose={props.close}
              refresh={props.refresh}
            />
          )}

          {props.currentAttachment?.fileType === AttachmentType.OTHER && (
            <SurveyAttachmentDialog
              projectId={props.projectId}
              surveyId={props.surveyId}
              attachmentId={props.currentAttachment?.id}
              currentAttachment={props.currentAttachment}
              dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
              open={props.open}
              onClose={props.close}
              refresh={props.refresh}
            />
          )}
        </>
      )}
      {!props.surveyId && instanceOfIGetProjectAttachment(props.currentAttachment) && (
        <>
          {props.currentAttachment?.fileType === AttachmentType.REPORT && (
            <ProjectReportAttachmentDialog
              projectId={props.projectId}
              attachmentId={props.currentAttachment?.id}
              currentAttachment={props.currentAttachment}
              dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
              open={props.open}
              onClose={props.close}
              refresh={props.refresh}
            />
          )}

          {props.currentAttachment?.fileType === AttachmentType.OTHER && (
            <ProjectAttachmentDialog
              projectId={props.projectId}
              attachmentId={props.currentAttachment?.id}
              currentAttachment={props.currentAttachment}
              dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
              open={props.open}
              onClose={props.close}
              refresh={props.refresh}
            />
          )}
        </>
      )}
    </>
  );
};

export default AttachmentTypeSelector;
