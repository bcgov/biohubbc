import { Button, DialogContent, DialogContentText } from '@material-ui/core';
import { mdiShareAllOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import PublishSurveySections, {
  ISurveySubmitForm,
  SurveySubmitFormInitialValues,
  SurveySubmitFormYupSchema
} from 'components/publish/PublishSurveySections';
import { SUBMISSION_STATUS_TYPE } from 'constants/submissions';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetObservationSubmissionResponse, ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { IGetSummaryResultsResponse, ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import {
  IGetSurveyAttachment,
  IGetSurveyAttachmentsResponse,
  IGetSurveyReportAttachment
} from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';

/**
 * Survey header for a single-survey view.
 *
 * @param {*} props
 * @return {*}
 */
const PublishSurveyButton: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const surveyDataLoader = surveyContext.surveyDataLoader;
  const observationDataLoader = surveyContext.observationDataLoader;
  const artifactDataLoader = surveyContext.artifactDataLoader;
  const summaryDataLoader = surveyContext.summaryDataLoader;

  const [finishSubmission, setFinishSubmission] = useState(false);
  const [noSubmissionData, setNoSubmissionData] = useState(false);
  const [openSubmitSurveyDialog, setOpenSubmitSurveyDialog] = useState(false);

  const refreshContext = (values: ISurveySubmitForm) => {
    // we only want the data loaders with changes to refresh
    if (values.observations.length > 0) {
      surveyContext.observationDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    if (values.summary.length > 0) {
      surveyContext.summaryDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    if (values.attachments.length > 0 || values.reports.length > 0) {
      surveyContext.artifactDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  };

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
      <Button
        title="Submit Survey Data and Documents"
        color="primary"
        variant="contained"
        startIcon={<Icon path={mdiShareAllOutline} size={1} />}
        onClick={() => checkUnsubmittedData()}
        style={{ minWidth: '7rem' }}>
        Submit Data
      </Button>

      <ComponentDialog
        dialogTitle="Survey data submitted!"
        open={finishSubmission}
        onClose={() => {
          setFinishSubmission(false);
        }}>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Thank you for submitting your survey data to Biohub.
          </DialogContentText>
        </DialogContent>
      </ComponentDialog>

      <ComponentDialog
        dialogTitle="No Survey Data to Submit"
        open={noSubmissionData}
        onClose={() => {
          setNoSubmissionData(false);
        }}>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Thank you!</DialogContentText>
        </DialogContent>
      </ComponentDialog>

      <SubmitBiohubDialog
        dialogTitle="Submit Survey Information"
        open={openSubmitSurveyDialog}
        onClose={() => setOpenSubmitSurveyDialog(!openSubmitSurveyDialog)}
        onSubmit={async (values: ISurveySubmitForm) => {
          if (surveyDataLoader.data) {
            await biohubApi.publish.publishSurvey(
              surveyContext.projectId,
              surveyDataLoader.data.surveyData.survey_details.id,
              values
            );
          }
          refreshContext(values);
          setFinishSubmission(true);
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
      </SubmitBiohubDialog>
    </>
  );
};

export default PublishSurveyButton;

const idExists = (item: any) => {
  if (item) {
    return true;
  }
  return false;
};

export const unSubmittedObservation = (
  data: IGetObservationSubmissionResponse | undefined
): ISurveyObservationData[] => {
  if (
    data &&
    data.surveyObservationData &&
    !idExists(data.surveyObservationSupplementaryData?.occurrence_submission_id) &&
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
    !idExists(data.surveySummarySupplementaryData?.survey_summary_submission_id) &&
    data.surveySummaryData.messages.length === 0
  ) {
    return [data.surveySummaryData];
  }
  return [];
};

const unSubmittedReports = (data: IGetSurveyAttachmentsResponse | undefined): IGetSurveyReportAttachment[] => {
  if (data) {
    return data.reportAttachmentsList.filter(
      (item) => !idExists(item.supplementaryAttachmentData?.artifact_revision_id)
    );
  }
  return [];
};

const unSubmittedAttachments = (data: IGetSurveyAttachmentsResponse | undefined): IGetSurveyAttachment[] => {
  if (data) {
    return data.attachmentsList.filter((item) => !idExists(item.supplementaryAttachmentData?.artifact_revision_id));
  }
  return [];
};
