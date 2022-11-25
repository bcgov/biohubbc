import { AttachmentType } from 'constants/attachments';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React } from 'react';
import ProjectReportAttachmentDialog from '../project/report/ProjectReportAttachmentDialog';
import ProjectAttachmentDialog from './attachment/ProjectAttachmentDialog';

export interface IProjectAttachmentTypeSelectorProps {
  projectId: number;
  currentAttachment: IGetProjectAttachment | IGetSurveyAttachment | null;
  open: boolean;
  close: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ProjectAttachmentTypeSelector: React.FC<IProjectAttachmentTypeSelectorProps> = (props) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <>
      {props.currentAttachment?.fileType === AttachmentType.REPORT && (
        <ProjectReportAttachmentDialog
          projectId={props.projectId}
          attachmentId={props.currentAttachment?.id}
          currentAttachment={props.currentAttachment}
          dialogProps={{ fullWidth: true, maxWidth: 'lg', open: props.open }}
          open={props.open}
          onClose={props.close}
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
        />
      )}
    </>
  );
};

export default ProjectAttachmentTypeSelector;
