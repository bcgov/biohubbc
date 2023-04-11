import { Button } from '@material-ui/core';
import { mdiShareAllOutline } from '@mdi/js';
import Icon from '@mdi/react';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import { ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IGetProjectAttachment,
  IGetProjectAttachmentsResponse,
  IGetProjectReportAttachment
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import PublishDialogs from './PublishDialogs';
import PublishProjectSections, {
  IProjectSubmitForm,
  ProjectSubmitFormInitialValues,
  ProjectSubmitFormYupSchema
} from './PublishProjectSections';

/**
 * Project publish button.
 *
 * @return {*}
 */
const PublishProjectButton: React.FC = () => {
  const biohubApi = useBiohubApi();
  const projectContext = useContext(ProjectContext);

  const projectDataLoader = projectContext.projectDataLoader;
  const artifactDataLoader = projectContext.artifactDataLoader;

  const [finishSubmission, setFinishSubmission] = useState(false);
  const [noSubmissionData, setNoSubmissionData] = useState(false);
  const [openSubmitProjectDialog, setOpenSubmitProjectDialog] = useState(false);

  const refreshContext = (values: any) => {
    // we only want the data loaders with changes to refresh
    if (values.attachments.length > 0 || values.reports.length > 0) {
      projectContext.artifactDataLoader.refresh(projectContext.projectId);
    }
    projectContext.projectDataLoader.refresh(projectContext.projectId);
  };

  const checkUnsubmittedData = () => {
    const reports: IGetProjectReportAttachment[] = unSubmittedReports(artifactDataLoader.data);
    const attachments: IGetProjectAttachment[] = unSubmittedAttachments(artifactDataLoader.data);

    if (reports.length === 0 && attachments.length === 0) {
      setNoSubmissionData(true);
      return;
    }
    setOpenSubmitProjectDialog(true);
  };

  return (
    <>
      <Button
        title="Submit Project Data and Documents"
        color="primary"
        variant="contained"
        startIcon={<Icon path={mdiShareAllOutline} size={1} />}
        onClick={() => checkUnsubmittedData()}
        style={{ minWidth: '7rem' }}>
        Submit Data
      </Button>

      <PublishDialogs
        finishSubmissionMessage="Thank you for submitting your project data to Biohub."
        finishSubmissionTitle="Project Data Submitted"
        finishSubmission={finishSubmission}
        setFinishSubmission={setFinishSubmission}
        noSubmissionData={noSubmissionData}
        setNoSubmissionData={setNoSubmissionData}
      />

      <SubmitBiohubDialog
        dialogTitle="Submit Project Information"
        open={openSubmitProjectDialog}
        onClose={() => setOpenSubmitProjectDialog(!openSubmitProjectDialog)}
        onSubmit={async (values: IProjectSubmitForm) => {
          if (projectDataLoader.data) {
            await biohubApi.publish.publishProject(projectContext.projectId, values);
          }
          refreshContext(values);
          setFinishSubmission(true);
        }}
        formikProps={{
          initialValues: ProjectSubmitFormInitialValues,
          validationSchema: ProjectSubmitFormYupSchema
        }}>
        <PublishProjectSections
          unSubmittedReports={unSubmittedReports(artifactDataLoader.data)}
          unSubmittedAttachments={unSubmittedAttachments(artifactDataLoader.data)}
        />
      </SubmitBiohubDialog>
    </>
  );
};

export default PublishProjectButton;

const idExists = (item: any) => {
  if (item) {
    return true;
  }
  return false;
};

const unSubmittedReports = (data: IGetProjectAttachmentsResponse | undefined): IGetProjectReportAttachment[] => {
  if (data) {
    return data.reportAttachmentsList.filter(
      (item) => !idExists(item.supplementaryAttachmentData?.artifact_revision_id)
    );
  }
  return [];
};

const unSubmittedAttachments = (data: IGetProjectAttachmentsResponse | undefined): IGetProjectAttachment[] => {
  if (data) {
    return data.attachmentsList.filter((item) => !idExists(item.supplementaryAttachmentData?.artifact_revision_id));
  }
  return [];
};
