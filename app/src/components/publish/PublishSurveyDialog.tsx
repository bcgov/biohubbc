import { Button } from '@material-ui/core';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import { SubmitSurveyBiohubI18N } from 'constants/i18n';
import { SUBMISSION_STATUS_TYPE } from 'constants/submissions';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetObservationSubmissionResponse, ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { ISurveySubmitForm } from 'interfaces/usePublishApi.interface';
import { IGetSummaryResultsResponse, ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import {
  IGetSurveyAttachment,
  IGetSurveyAttachmentsResponse,
  IGetSurveyReportAttachment
} from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import SubmitSection from './SubmitSection';

export interface ISubmitSurvey {
  unSubmittedObservation: ISurveyObservationData[];
  unSubmittedSummary: ISurveySummaryData[];
  unSubmittedReports: IGetSurveyReportAttachment[];
  unSubmittedAttachments: IGetSurveyAttachment[];
}


export const SurveySubmitFormInitialValues: ISurveySubmitForm = {
  observations: [],
  summary: [],
  reports: [],
  attachments: []
};

export const SurveySubmitFormYupSchema = yup.object().shape({
  observations: yup.array(),
  summary: yup.array(),
  reports: yup.array(),
  attachments: yup.array()
});

/**
 * Survey Publish button.
 *
 * @return {*}
 */
const PublishSurveyDialog: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const {
    surveyDataLoader,
    observationDataLoader,
    artifactDataLoader,
    summaryDataLoader,
    surveyId,
    projectId
  } = surveyContext;


  const checkUnsubmittedData = () => {
    const observation: ISurveyObservationData[] = unSubmittedObservation(observationDataLoader.data);
    const summary: ISurveySummaryData[] = unSubmittedSummary(summaryDataLoader.data);
    const reports: IGetSurveyReportAttachment[] = unSubmittedReports(artifactDataLoader.data);
    const attachments: IGetSurveyAttachment[] = unSubmittedAttachments(artifactDataLoader.data);

    if (observation.length === 0 && summary.length === 0 && reports.length === 0 && attachments.length === 0) {
      setNoSubmissionData(true);
      return;
    }
    setOpenSubmitSurveyDialog(true);
  };

  return (
    <>
      <SubmitBiohubDialog<ISurveySubmitForm>
        dialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubDialogTitle}
        submissionSuccessDialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubSuccessDialogTitle}
        submissionSuccessDialogText={SubmitSurveyBiohubI18N.submitSurveyBiohubSuccessDialogTitle}
        noSubmissionDataDialogTitle={SubmitSurveyBiohubI18N.submitSurveyBiohubNoSubmissionDataDialogTitle}
        noSubmissionDataDialogText={SubmitSurveyBiohubI18N.submitSurveyBiohubNoSubmissionDataDialogText}
        hasSubmissionData={hasSubmissionData}
        open={props.open}
        onClose={props.onClose}
        onSubmit={async (values: ISurveySubmitForm) => {
          if (surveyDataLoader.data) {
            biohubApi.publish.publishSurvey(
              projectId,
              surveyDataLoader.data.surveyData.survey_details.id,
              values
            ).then(() => {
              surveyDataLoader.refresh(projectId, surveyId);
              // we only want the data loaders with changes to refresh
              if (values.observations.length > 0) {
                surveyContext.observationDataLoader.refresh(projectId, surveyId);
              }
              if (values.summary.length > 0) {
                surveyContext.summaryDataLoader.refresh(projectId, surveyId);
              }
              if (values.attachments.length > 0 || values.reports.length > 0) {
                surveyContext.artifactDataLoader.refresh(projectId, surveyId);
              }
            })
          }
        }}
        formikProps={{
          initialValues: SurveySubmitFormInitialValues,
          validationSchema: SurveySubmitFormYupSchema
        }}>
        <PublishSurveySections
          unSubmittedObservation={unSubmittedObservation(observationDataLoader.data)}
          unSubmittedSummary={unSubmittedSummary(summaryDataLoader.data)}
          unSubmittedReports={unSubmittedReports(artifactDataLoader.data)}
          unSubmittedAttachments={unSubmittedAttachments(artifactDataLoader.data)}
        />

        <Box mb={2}>
          <Typography variant="body1" color="textSecondary">
            <strong>Please Note:</strong> Submitted data cannot be modified. You will need to contact an administrator if
            you need to modify submitted information.
          </Typography>
        </Box>

        <SelectAllButton
          formikData={[
            {
              key: 'observations',
              value: unSubmittedObservation
            },
            {
              key: 'summary',
              value: unSubmittedSummary
            },
            {
              key: 'reports',
              value: unSubmittedReports
            },
            {
              key: 'attachments',
              value: unSubmittedAttachments
            }
          ]}
        />

        {unSubmittedObservation.length !== 0 && (
          <SubmitSection
            subHeader="Observations"
            formikName="observations"
            data={unSubmittedObservation}
            getName={(item: ISurveyObservationData) => {
              return item.inputFileName;
            }}
          />
        )}

        {unSubmittedSummary.length !== 0 && (
          <SubmitSection
            subHeader="Summary Results"
            formikName="summary"
            data={unSubmittedSummary}
            getName={(item: ISurveySummaryData) => {
              return item.fileName;
            }}
          />
        )}

        {unSubmittedReports.length !== 0 && (
          <SubmitSection
            subHeader="Reports"
            formikName="reports"
            data={unSubmittedReports}
            getName={(item: IGetSurveyReportAttachment) => {
              return item.fileName;
            }}
          />
        )}

        {unSubmittedAttachments.length !== 0 && (
          <SubmitSection
            subHeader="Other Documents"
            formikName="attachments"
            data={unSubmittedAttachments}
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

export const unSubmittedObservation = (
  data: IGetObservationSubmissionResponse | undefined
): ISurveyObservationData[] => {
  if (
    data &&
    data.surveyObservationData &&
    !data.surveyObservationSupplementaryData?.occurrence_submission_id &&
    data.surveyObservationData.status === SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED
  ) {
    return [data.surveyObservationData];
  }
  return [];
};

const unSubmittedSummary = (data: IGetSummaryResultsResponse | undefined): ISurveySummaryData[] => {
  if (
    data &&
    data.surveySummaryData &&
    !data.surveySummarySupplementaryData?.survey_summary_submission_id &&
    data.surveySummaryData.messages.length === 0
  ) {
    return [data.surveySummaryData];
  }
  return [];
};

const unSubmittedReports = (data: IGetSurveyAttachmentsResponse | undefined): IGetSurveyReportAttachment[] => {
  return data
    ? data.reportAttachmentsList.filter((item) => !item.supplementaryAttachmentData?.artifact_revision_id)
    : [];
};

const unSubmittedAttachments = (data: IGetSurveyAttachmentsResponse | undefined): IGetSurveyAttachment[] => {
  return data ? data.attachmentsList.filter((item) => !item.supplementaryAttachmentData?.artifact_revision_id) : [];
};
