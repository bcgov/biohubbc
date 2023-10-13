import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import NoSurveySectionData from 'features/surveys/components/NoSurveySectionData';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useEffect, useState } from 'react';
import FileSummaryResults from './components/FileSummaryResults';
import SummaryResultsErrors from './components/SummaryResultsErrors';
import SummaryResultsLoading from './components/SummaryResultsLoading';

export enum ClassGrouping {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}

const SurveySummaryResults = () => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

  const projectId = surveyContext.projectId as number;
  const surveyId = surveyContext.surveyId as number;

  const [openImportSummaryResults, setOpenImportSummaryResults] = useState(false);

  // provide file name for 'loading' ui before submission responds
  const [fileName, setFileName] = useState('');
  useEffect(() => {
    surveyContext.summaryDataLoader.load(projectId, surveyId);
  }, [surveyContext.summaryDataLoader, projectId, surveyId]);

  const summaryData = surveyContext.summaryDataLoader.data?.surveySummaryData;

  const importSummaryResults = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey
        .uploadSurveySummaryResults(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        .finally(() => {
          setFileName(file.name);
          surveyContext.summaryDataLoader.refresh(projectId, surveyId);
        });
    };
  };

  const showDeleteDialog = () => {
    if (summaryData) {
      dialogContext.setYesNoDialog({
        dialogTitle: 'Delete Summary Results Data?',
        dialogText:
          'Are you sure you want to delete the summary results data for this survey? This action cannot be undone.',
        yesButtonProps: { color: 'error' },
        yesButtonLabel: 'Delete',
        noButtonProps: { color: 'primary' },
        noButtonLabel: 'Cancel',
        open: true,
        onYes: async () => {
          await biohubApi.survey.deleteSummarySubmission(projectId, surveyId, summaryData.survey_summary_submission_id);
          surveyContext.summaryDataLoader.refresh(projectId, surveyId);
          dialogContext.setYesNoDialog({ open: false });
        },
        onClose: () => dialogContext.setYesNoDialog({ open: false }),
        onNo: () => dialogContext.setYesNoDialog({ open: false })
      });
    }
  };

  const viewFileContents = async () => {
    if (!summaryData) {
      return;
    }

    let response;

    try {
      response = await biohubApi.survey.getSummarySubmissionSignedURL(
        projectId,
        surveyId,
        summaryData?.survey_summary_submission_id
      );
    } catch {
      return;
    }

    if (!response) {
      return;
    }

    window.open(response);
  };

  return (
    <>
      <Toolbar>
        <Typography variant="h2">Summary Results</Typography>
      </Toolbar>

      <Divider />

      <Box p={3}>
        {/* Data is still loading/ validating */}
        {!summaryData && !surveyContext.summaryDataLoader.isReady && <SummaryResultsLoading fileLoading={fileName} />}

        {/* No summary */}
        {!surveyContext.summaryDataLoader.data && surveyContext.summaryDataLoader.isReady && (
          <NoSurveySectionData text={'Currently Unavailable'} paperVariant="outlined" />
        )}

        {/* Got a summary with errors */}
        {summaryData && !surveyContext.summaryDataLoader.isLoading && summaryData.messages.length > 0 && (
          <SummaryResultsErrors messages={summaryData.messages} />
        )}

        {/* All done */}
        {surveyContext.summaryDataLoader.data && (
          <FileSummaryResults
            fileData={surveyContext.summaryDataLoader.data}
            downloadFile={viewFileContents}
            showDelete={showDeleteDialog}
          />
        )}
      </Box>

      <ComponentDialog
        open={openImportSummaryResults}
        dialogTitle="Import Summary Results Data"
        onClose={() => setOpenImportSummaryResults(false)}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.xls, .xlsm, .xlsx' }}
          uploadHandler={importSummaryResults()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveySummaryResults;
