import { Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FailureDialog from 'components/dialog/FailureDialog';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import SuccessDialog from 'components/dialog/SuccessDialog';
import { ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IGetProjectAttachment,
  IGetProjectAttachmentsResponse,
  IGetProjectReportAttachment
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
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

  const [successSubmission, setSuccessSubmission] = useState(false);
  const [failureSubmission, setFailureSubmission] = useState(false);
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
      setFailureSubmission(true);
      return;
    }
    setOpenSubmitProjectDialog(true);
  };

  return (
    <>
      <Button
        title="Submit Project Documents"
        color="primary"
        variant="contained"
        onClick={() => checkUnsubmittedData()}
        style={{ minWidth: '8rem' }}>
        <strong>Submit</strong>
      </Button>

      <SuccessDialog
        successTitle="Project documents submitted"
        successMessage="Thank you for submitting your project data to Biohub."
        open={successSubmission}
        onClose={() => setSuccessSubmission(false)}
      />

      <FailureDialog
        failureTitle="No documents to submit"
        failureMessage="No new documents have been added to this project to submit."
        open={failureSubmission}
        onClose={() => setFailureSubmission(false)}
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
          setSuccessSubmission(true);
        }}
        formikProps={{
          initialValues: ProjectSubmitFormInitialValues,
          validationSchema: ProjectSubmitFormYupSchema
        }}>
        <Box mb={2}>
          <Typography variant="body1" color="textSecondary">
            <strong>Please Note:</strong> Submitted data cannot be modified. You will need to contact an administrator
            if you need to modify submitted information.
          </Typography>
        </Box>

        <PublishProjectSections
          unSubmittedReports={unSubmittedReports(artifactDataLoader.data)}
          unSubmittedAttachments={unSubmittedAttachments(artifactDataLoader.data)}
        />
      </SubmitBiohubDialog>
    </>
  );
};

export default PublishProjectButton;

const unSubmittedReports = (data: IGetProjectAttachmentsResponse | undefined): IGetProjectReportAttachment[] => {
  return data
    ? data.reportAttachmentsList.filter((item) => !item.supplementaryAttachmentData?.artifact_revision_id)
    : [];
};

const unSubmittedAttachments = (data: IGetProjectAttachmentsResponse | undefined): IGetProjectAttachment[] => {
  return data ? data.attachmentsList.filter((item) => !item.supplementaryAttachmentData?.artifact_revision_id) : [];
};
