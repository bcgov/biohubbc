import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React } from 'react';
import ProjectAttachmentTypeSelector from './project/ProjectAttachmentTypeSelector';
import SurveyAttachmentTypeSelector from './survey/SurveyAttachmentTypeSelector';

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
  console.log('props in the AllAttachmentDetailsDialog: ', props);

  return (
    <>
      {props.surveyId && (
        <SurveyAttachmentTypeSelector
          projectId={props.projectId}
          surveyId={props.surveyId}
          currentAttachment={props.currentAttachment}
          open={props.open}
          close={props.close}
        />
      )}
      {!props.surveyId && (
        <ProjectAttachmentTypeSelector
          projectId={props.projectId}
          currentAttachment={props.currentAttachment}
          open={props.open}
          close={props.close}
        />
      )}
    </>
  );
};

export default AllAttachmentDetailsDialog;
