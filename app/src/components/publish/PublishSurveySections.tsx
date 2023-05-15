import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import { IGetSurveyAttachment, IGetSurveyReportAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React } from 'react';
import yup from 'utils/YupSchema';
import SelectAllButton from './SelectAllButton';
import SubmitSection from './SubmitSection';
import { ISurveySubmitForm } from 'interfaces/usePublishApi.interface';

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

const PublishSurveySections: React.FC<ISubmitSurvey> = (props) => {
  const { unSubmittedObservation, unSubmittedSummary, unSubmittedReports, unSubmittedAttachments } = props;

  return (
    <>
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
    </>
  );
};

export default PublishSurveySections;
