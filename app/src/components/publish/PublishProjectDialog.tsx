import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import { SubmitProjectBiohubI18N } from 'constants/i18n';
import { ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment, IGetProjectReportAttachment } from 'interfaces/useProjectApi.interface';
import { IProjectSubmitForm } from 'interfaces/usePublishApi.interface';
import { useContext } from 'react';
import yup from 'utils/YupSchema';
import SelectAllButton from './SelectAllButton';
import SubmitSection from './SubmitSection';

export interface ISubmitProject {
  unSubmittedReports: IGetProjectReportAttachment[];
  unSubmittedAttachments: IGetProjectAttachment[];
}

interface IPublishProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const projectSubmitFormInitialValues: IProjectSubmitForm = {
  reports: [],
  attachments: []
};

const projectSubmitFormYupSchema = yup.object().shape({
  reports: yup.array(),
  attachments: yup.array()
});

const excludesArtifactRevisionId = (item: IGetProjectReportAttachment | IGetProjectAttachment) => {
  return !item.supplementaryAttachmentData?.artifact_revision_id;
};

/**
 * Project publish button.
 *
 * @return {*}
 */
const PublishProjectDialog = (props: IPublishProjectDialogProps) => {
  const biohubApi = useBiohubApi();
  const projectContext = useContext(ProjectContext);
  const { projectDataLoader, artifactDataLoader } = projectContext;

  const unsubmittedReports = artifactDataLoader.data?.reportAttachmentsList.filter(excludesArtifactRevisionId) ?? [];
  const unsubmittedAttachments = artifactDataLoader.data?.attachmentsList.filter(excludesArtifactRevisionId) ?? [];
  const hasSubmissionData = unsubmittedAttachments.length > 0 || unsubmittedReports.length > 0;

  return (
    <>
      <SubmitBiohubDialog<IProjectSubmitForm>
        dialogTitle={SubmitProjectBiohubI18N.submitProjectBiohubDialogTitle}
        submissionSuccessDialogTitle={SubmitProjectBiohubI18N.submitProjectBiohubSuccessDialogTitle}
        submissionSuccessDialogText={SubmitProjectBiohubI18N.submitProjectBiohubSuccessDialogText}
        noSubmissionDataDialogTitle={SubmitProjectBiohubI18N.submitProjectBiohubNoSubmissionDataDialogTitle}
        noSubmissionDataDialogText={SubmitProjectBiohubI18N.submitProjectBiohubNoSubmissionDataDialogText}
        hasSubmissionData={hasSubmissionData}
        open={props.open}
        onClose={props.onClose}
        onSubmit={async (values: IProjectSubmitForm) => {
          if (projectDataLoader.data) {
            return biohubApi.publish.publishProject(projectContext.projectId, values).then(() => {
              projectContext.projectDataLoader.refresh(projectContext.projectId);
              if (values.attachments.length > 0 || values.reports.length > 0) {
                projectContext.artifactDataLoader.refresh(projectContext.projectId);
              }
            });
          }
        }}
        formikProps={{
          initialValues: projectSubmitFormInitialValues,
          validationSchema: projectSubmitFormYupSchema
        }}>
        <Box mb={2}>
          <Typography variant="body1" color="textSecondary">
            <strong>Please Note:</strong> Submitted data cannot be modified. You will need to contact an administrator
            if you need to modify submitted information.
          </Typography>
        </Box>

        <SelectAllButton
          formikData={[
            {
              key: 'reports',
              value: unsubmittedReports
            },
            {
              key: 'attachments',
              value: unsubmittedAttachments
            }
          ]}
        />

        {unsubmittedReports.length > 0 && (
          <SubmitSection
            subHeader="Reports"
            formikName="reports"
            data={unsubmittedReports}
            getName={(item: IGetProjectReportAttachment) => {
              return item.fileName;
            }}
          />
        )}

        {unsubmittedAttachments.length > 0 && (
          <SubmitSection
            subHeader="Other Documents"
            formikName="attachments"
            data={unsubmittedAttachments}
            getName={(item: IGetProjectAttachment) => {
              return item.fileName;
            }}
          />
        )}
      </SubmitBiohubDialog>
    </>
  );
};

export default PublishProjectDialog;
