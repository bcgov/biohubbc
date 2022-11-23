import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React } from 'react';
import ProjectAttachmentDetailsDialog from './ProjectAttachmentDetailsDialog';
import SurveyAttachmentDetailsDialog from './SurveyAttachmentDetailsDialog';

export interface IAllAttachmentDetailsDialogProps {
  projectId: number;
  surveyId?: number;
  currentAttachment: IGetProjectAttachment | IGetSurveyAttachment | null;
  open: boolean;
  close: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const AllAttachmentDetailsDialog: React.FC<IAllAttachmentDetailsDialogProps> = (props) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <>
      {props.surveyId && (
        <SurveyAttachmentDetailsDialog
          projectId={props.projectId}
          surveyId={props.surveyId}
          attachmentId={props.currentAttachment?.id}
          currentAttachment={props.currentAttachment}
          dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
          open={props.open}
          onClose={props.close}
        />
      )}
      {!props.surveyId && (
        <ProjectAttachmentDetailsDialog
          projectId={props.projectId}
          attachmentId={props.currentAttachment?.id}
          currentAttachment={props.currentAttachment}
          dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
          open={props.open}
          onClose={props.close}
        />
      )}
    </>
  );
};

export default AllAttachmentDetailsDialog;
