import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';
import SubmitSection from './SubmitSection';

export interface ISubmitSurvey {
  surveyDetails: IGetSurveyForViewResponse;
}

export interface ISurveySubmitForm {
  observations: any[];
  summarys: any[];
  reports: any[];
  attachments: any[];
}

export const SurveySubmitFormInitialValues: ISurveySubmitForm = {
  observations: [],
  summarys: [],
  reports: [],
  attachments: []
};

export const SurveySubmitFormYupSchema = yup.object().shape({
  observations: yup.array(),
  summary: yup.array(),
  reports: yup.array(),
  attachments: yup.array()
});

const SubmitSurvey: React.FC<ISubmitSurvey> = (props) => {
  const biohubApi = useBiohubApi();

  const { surveyDetails } = props;

  const observationDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.observation.getObservationSubmission(projectId, surveyId)
  );
  useDataLoaderError(observationDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Occurrence Details',
      dialogText:
        'An error has occurred while attempting to load occurrence deteails, please try again. If the error persists, please contact your system administrator.'
    };
  });
  observationDataLoader.load(
    surveyDetails.surveyData.survey_details.project_id,
    surveyDetails.surveyData.survey_details.id
  );
  // console.log('observationDataLoader.data', observationDataLoader.data);

  const summaryDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveySummarySubmission(projectId, surveyId)
  );
  useDataLoaderError(summaryDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Summary Details',
      dialogText:
        'An error has occurred while attempting to load Summary deteails, please try again. If the error persists, please contact your system administrator.'
    };
  });
  summaryDataLoader.load(
    surveyDetails.surveyData.survey_details.project_id,
    surveyDetails.surveyData.survey_details.id
  );
  // console.log('summaryDataLoader.data', summaryDataLoader.data);

  const reportDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyAttachments(projectId, surveyId)
  );
  useDataLoaderError(reportDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Report Details',
      dialogText:
        'An error has occurred while attempting to load Report deteails, please try again. If the error persists, please contact your system administrator.'
    };
  });
  reportDataLoader.load(surveyDetails.surveyData.survey_details.project_id, surveyDetails.surveyData.survey_details.id);
  // console.log('reportDataLoader.data', reportDataLoader.data);

  return (
    <Container maxWidth={false} disableGutters>
      <Box pb={5}>
        <Typography variant="body1" style={{ color: '#787f81' }}>
          <strong>Please Note:</strong> Submitted data cannot be modified. You will need to contact an administrator if
          you need to modify submitted information.
        </Typography>
      </Box>

      {observationDataLoader.isReady && (
        <SubmitSection
          subHeader="OBSERVATIONS"
          formikName="observations"
          data={!!observationDataLoader.data ? [observationDataLoader.data] : []}
          nameLocation="inputFileName"
        />
      )}

      {summaryDataLoader.isReady && (
        <SubmitSection
          subHeader="SUMMARY RESULTS"
          formikName="summarys"
          data={!!summaryDataLoader.data ? [summaryDataLoader.data] : []}
          nameLocation="fileName"
        />
      )}

      {reportDataLoader.isReady && (
        <SubmitSection
          subHeader="REPORTS"
          formikName="reports"
          data={reportDataLoader.data && reportDataLoader.data.reportAttachmentsList}
          nameLocation="fileName"
        />
      )}

      {reportDataLoader.isReady && (
        <SubmitSection
          subHeader="OTHER DOCUMENTS"
          formikName="attachments"
          data={reportDataLoader.data && reportDataLoader.data.attachmentsList}
          nameLocation="fileName"
        />
      )}
    </Container>
  );
};

export default SubmitSurvey;
