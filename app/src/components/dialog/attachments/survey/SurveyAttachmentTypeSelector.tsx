import { AttachmentType } from 'constants/attachments';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React } from 'react';
import SurveyAttachmentDialog from './SurveyAttachmentDialog';
import SurveyReportAttachmentDialog from './SurveyReportAttachmentDialog';

export interface ISurveyAttachmentTypeSelectorProps {
  projectId: number;
  surveyId: number;
  currentAttachment: IGetProjectAttachment | IGetSurveyAttachment | null;
  open: boolean;
  close: () => void;
  refresh: (id: number) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const SurveyAttachmentTypeSelector: React.FC<ISurveyAttachmentTypeSelectorProps> = (props) => {
  if (!props.open) {
    return <></>;
  }

  return (
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
  );
};

export default SurveyAttachmentTypeSelector;
