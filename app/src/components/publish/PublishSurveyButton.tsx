import { Button, DialogContent, DialogContentText } from '@material-ui/core';
import { mdiShareAllOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import SubmitSurvey, {
  ISurveySubmitForm,
  SurveySubmitFormInitialValues,
  SurveySubmitFormYupSchema
} from 'components/publish/SubmitSurvey';
import { SUBMISSION_STATUS_TYPE } from 'constants/submissions';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import { IGetSurveyAttachment, IGetSurveyReportAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';

export interface IPublishSurveyButton {}

/**
 * Survey header for a single-survey view.
 *
 * @param {*} props
 * @return {*}
 */
const PublishSurveyButton: React.FC<IPublishSurveyButton> = (props) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const surveyWithDetails = surveyContext.surveyDataLoader.data;

  const [finishSubmission, setFinishSubmission] = useState(false);
  const [noSubmissionData, setNoSubmissionData] = useState(false);
  const [openSubmitSurveyDialog, setOpenSubmitSurveyDialog] = useState(false);

  if (!surveyWithDetails) {
    return <></>;
  }

  return (
    <>
      <Button
        title="Submit Survey Data and Documents"
        color="primary"
        variant="contained"
        startIcon={<Icon path={mdiShareAllOutline} size={1} />}
        onClick={() => setOpenSubmitSurveyDialog(!openSubmitSurveyDialog)}
        style={{ minWidth: '7rem' }}>
        Submit Data
      </Button>

      <ComponentDialog
        dialogTitle="Survey data submitted!"
        open={finishSubmission}
        onClose={() => {
          surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
          surveyContext.artifactDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
          setFinishSubmission(false);
          setOpenSubmitSurveyDialog(!openSubmitSurveyDialog);
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
          surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
          surveyContext.artifactDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
          setNoSubmissionData(false);
          setOpenSubmitSurveyDialog(!openSubmitSurveyDialog);
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
          await biohubApi.publish.publishSurvey(
            surveyContext.projectId,
            surveyWithDetails.surveyData.survey_details.id,
            values
          );
          setFinishSubmission(true);
        }}
        formikProps={{
          initialValues: SurveySubmitFormInitialValues,
          validationSchema: SurveySubmitFormYupSchema
        }}>
        <SubmitSurvey
          unSubmittedObservation={unSubmittedObservation}
          unSubmittedSummary={unSubmittedSummary}
          unSumittedArtifacts={unSumittedArtifacts}
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

const unSubmittedObservation = (data: IGetObservationSubmissionResponse) => {
  if (
    data.surveyObservationData &&
    !idExists(data.surveyObservationSupplementaryData?.occurrence_submission_id) &&
    data.surveyObservationData.status === SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED
  ) {
    return [data.surveyObservationData];
  }
  return [];
};

const unSubmittedSummary = (data: IGetSummaryResultsResponse) => {
  if (
    data.surveySummaryData &&
    !idExists(data.surveySummarySupplementaryData?.survey_summary_submission_id) &&
    data.surveySummaryData.messages.length === 0
  ) {
    return [data.surveySummaryData];
  }
  return [];
};

const unSumittedArtifacts = (data: IGetSurveyAttachment[] | IGetSurveyReportAttachment[]) => {
  if (data) {
    return data.filter((item) => !idExists(item.supplementaryAttachmentData?.artifact_revision_id));
  }
  return [];
};
