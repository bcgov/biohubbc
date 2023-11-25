import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import { SubmitSurveyBiohubI18N } from 'constants/i18n';
import { SUBMISSION_STATUS_TYPE } from 'constants/submissions';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ISurveyObservationData } from 'interfaces/useDwcaApi.interface';
import { ISurveySubmitForm } from 'interfaces/usePublishApi.interface';
import { ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import { IGetSurveyAttachment, IGetSurveyReportAttachment } from 'interfaces/useSurveyApi.interface';
import * as React from 'react';
import { useContext } from 'react';
import yup from 'utils/YupSchema';
// import SelectAllButton from './SelectAllButton';
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
const OldPublishSurveyDialog = (props: IPublishSurveyDialogProps) => {
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

  const [state, setState] = React.useState({
    agreement1: false,
    agreement2: false,
    agreement3: false
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked
    });
  };

  const { agreement1, agreement2, agreement3 } = state;
  // const error = [gilad, jason, antoine].filter((v) => v).length !== 2;

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
        <Stack gap={4} divider={<Divider flexItem></Divider>}>
          {/* <Alert severity="info" sx={{fontSize: '1rem'}}>
            Published data may be secured according to the Species and Ecosystems Data and Information Security (SEDIS) Policy. <a href="https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/laws-policies-standards-guidance/data-information-security" target="_blank">Learn more</a>
          </Alert> */}
          <Typography variant="body1" color="textSecondary">
            Published data from this survey may be secured according to the Species and Ecosystems Data and Information
            Security (SEDIS) Policy.
          </Typography>
          {/* <Box component="fieldset"
            sx={{
              '& p + p': {
                mt: 2
              }
            }}
          >
            <Typography component="legend">What information is going to be published?</Typography>
            <Typography variant="body1" color="textSecondary" sx={{mt: -0.75}}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Typography>
          </Box> */}
          <Box component="fieldset">
            <Typography component="legend">Additional Information</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: -0.75 }}>
              Provide any additional information about this survey that Data Stewards should be aware of, including
              reasons why the information for this survey should be secured.
            </Typography>
            <TextField
              fullWidth
              multiline
              label=""
              placeholder="Additional information, security concerns, etc."
              rows="3"
              aria-label="Additional Information"
              sx={{ mt: 3 }}
            />
          </Box>
          <Box component="fieldset">
            <Typography component="legend">Agreements</Typography>
            <FormGroup>
              <Alert severity="error" sx={{ display: 'none', mb: 2 }}>
                You must accept all the following agreements.
              </Alert>
              <FormControlLabel
                slotProps={{ typography: { variant: 'body2' } }}
                sx={{
                  mt: -0.5,
                  mb: 1.5,
                  ml: '6px',
                  '& .MuiCheckbox-root': {
                    mr: 0.5
                  }
                }}
                label="I am authorized to publish information and data for this survey."
                control={<Checkbox checked={agreement1} onChange={handleChange} name="agreement1" />}
              />
              <FormControlLabel
                sx={{
                  ml: '6px',
                  mb: 3,
                  alignItems: 'flex-start',
                  '& .MuiCheckbox-root': {
                    mt: '-11px',
                    mr: 0.5
                  }
                }}
                label={
                  <Typography variant="body2">
                    I confirm that all published data for this survey meets or exceed the{' '}
                    <a href="#">Freedom of Information and Protection of Privacy Act (FOIPPA)</a> requirements.
                  </Typography>
                }
                control={<Checkbox checked={agreement2} onChange={handleChange} name="agreement2" />}
              />
              <FormControlLabel
                sx={{
                  ml: '6px',
                  alignItems: 'flex-start',
                  '& .MuiCheckbox-root': {
                    mt: '-11px',
                    mr: 0.5
                  }
                }}
                label={
                  <Typography variant="body2">
                    I confirm that all data and information for this survey has been collected legally, and in
                    accordance with Section 1 of the{' '}
                    <a
                      href="https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/laws-policies-standards-guidance/data-information-security"
                      target="_blank"
                      rel="noreferrer">
                      Species and Ecosystems Data and Information Security (SEDIS)
                    </a>{' '}
                    procedures.
                  </Typography>
                }
                control={<Checkbox checked={agreement3} onChange={handleChange} name="agreement3" />}
              />
            </FormGroup>
          </Box>
        </Stack>

        {/* <SelectAllButton
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
        /> */}

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

export default OldPublishSurveyDialog;
