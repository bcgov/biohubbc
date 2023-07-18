import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import { SubmitSurveyBiohubI18N } from 'constants/i18n';
import { SUBMISSION_STATUS_TYPE } from 'constants/submissions';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { ISurveySubmitForm } from 'interfaces/usePublishApi.interface';
import { ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import { IGetSurveyAttachment, IGetSurveyReportAttachment } from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';
import yup from 'utils/YupSchema';
import SelectAllButton from './SelectAllButton';
import SubmitSection from './SubmitSection';

export interface ISubmitSurvey {
  unSubmittedObservation: ISurveyObservationData[];
  unSubmittedSummary: ISurveySummaryData[];
  unSubmittedReports: IGetSurveyReportAttachment[];
  unSubmittedAttachments: IGetSurveyAttachment[];
}

interface IPublishSurveyDialogProps {
  open: boolean;
  onClose: () => void;
}

const surveySubmitFormInitialValues: ISurveySubmitForm = {
  observations: [],
  summary: [],
  reports: [],
  attachments: []
};

const surveySubmitFormYupSchema = yup.object().shape({
  observations: yup.array(),
  summary: yup.array(),
  reports: yup.array(),
  attachments: yup.array()
});

const excludesArtifactRevisionId = (item: IGetSurveyReportAttachment | IGetSurveyAttachment) => {
  return !item.supplementaryAttachmentData?.artifact_revision_id;
};

/**
 * Survey Publish button.
 *
 * @return {*}
 */
const PublishSurveyDialog = (props: IPublishSurveyDialogProps) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const { surveyDataLoader, observationDataLoader, artifactDataLoader, summaryDataLoader, surveyId, projectId } =
    surveyContext;

  const unsubmittedObservations: ISurveyObservationData[] = [];
  const unsubmittedSummaryResults: ISurveySummaryData[] = [];
  const unsubmittedReports: IGetSurveyReportAttachment[] =
    artifactDataLoader.data?.reportAttachmentsList.filter(excludesArtifactRevisionId) ?? [];
  const unsubmittedAttachments: IGetSurveyAttachment[] =
    artifactDataLoader.data?.attachmentsList.filter(excludesArtifactRevisionId) ?? [];

  if (
    observationDataLoader.data?.surveyObservationData &&
    !observationDataLoader.data.surveyObservationSupplementaryData?.occurrence_submission_id &&
    observationDataLoader.data.surveyObservationData.status === SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED
  ) {
    unsubmittedObservations.push(observationDataLoader.data.surveyObservationData);
  }

  if (
    summaryDataLoader.data?.surveySummaryData &&
    !summaryDataLoader.data.surveySummarySupplementaryData?.survey_summary_submission_id &&
    summaryDataLoader.data.surveySummaryData.messages.length === 0
  ) {
    unsubmittedSummaryResults.push(summaryDataLoader.data.surveySummaryData);
  }

  const hasSubmissionData = Boolean(
    unsubmittedObservations.length > 0 ||
      unsubmittedSummaryResults.length > 0 ||
      unsubmittedReports.length > 0 ||
      unsubmittedAttachments.length > 0
  );

  return (
    <>
      <SubmitBiohubDialog<ISurveySubmitForm>
        dialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubDialogTitle}
        submissionSuccessDialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubSuccessDialogTitle}
        submissionSuccessDialogText={SubmitSurveyBiohubI18N.submitSurveyBiohubSuccessDialogText}
        noSubmissionDataDialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubNoSubmissionDataDialogTitle}
        noSubmissionDataDialogText={SubmitSurveyBiohubI18N.submitSurveyBiohubNoSubmissionDataDialogText}
        hasSubmissionData={hasSubmissionData}
        open={props.open}
        onClose={props.onClose}
        onSubmit={async (values: ISurveySubmitForm) => {
          if (surveyDataLoader.data) {
            return biohubApi.publish
              .publishSurvey(projectId, surveyDataLoader.data.surveyData.survey_details.id, values)
              .then(() => {
                surveyDataLoader.refresh(projectId, surveyId);
                if (values.observations.length > 0) {
                  surveyContext.observationDataLoader.refresh(projectId, surveyId);
                }
                if (values.summary.length > 0) {
                  surveyContext.summaryDataLoader.refresh(projectId, surveyId);
                }
                if (values.attachments.length > 0 || values.reports.length > 0) {
                  surveyContext.artifactDataLoader.refresh(projectId, surveyId);
                }
              });
          }
        }}
        formikProps={{
          initialValues: surveySubmitFormInitialValues,
          validationSchema: surveySubmitFormYupSchema
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
              key: 'observations',
              value: unsubmittedObservations
            },
            {
              key: 'summary',
              value: unsubmittedSummaryResults
            },
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

        {unsubmittedObservations.length !== 0 && (
          <SubmitSection
            subHeader="Observations"
            formikName="observations"
            data={unsubmittedObservations}
            getName={(item: ISurveyObservationData) => {
              return item.inputFileName;
            }}
          />
        )}

        {unsubmittedSummaryResults.length !== 0 && (
          <SubmitSection
            subHeader="Summary Results"
            formikName="summary"
            data={unsubmittedSummaryResults}
            getName={(item: ISurveySummaryData) => {
              return item.fileName;
            }}
          />
        )}

        {unsubmittedReports.length !== 0 && (
          <SubmitSection
            subHeader="Reports"
            formikName="reports"
            data={unsubmittedReports}
            getName={(item: IGetSurveyReportAttachment) => {
              return item.fileName;
            }}
          />
        )}

        {unsubmittedAttachments.length !== 0 && (
          <SubmitSection
            subHeader="Other Documents"
            formikName="attachments"
            data={unsubmittedAttachments}
            getName={(item: IGetSurveyAttachment) => {
              return item.fileName;
            }}
          />
        )}
      </SubmitBiohubDialog>
    </>
  );
};

export default PublishSurveyDialog;
