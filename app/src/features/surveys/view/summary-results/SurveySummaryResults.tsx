import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useEffect, useState } from 'react';
import FileSummaryResults from './components/FileSummaryResults';
import NoSummaryResults from './components/NoSummaryResults';
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

  const showUploadDialog = () => {
    if (summaryData) {
      // already have summary data, prompt user to confirm override
      dialogContext.setYesNoDialog({
        dialogTitle: 'Import New Summary Results Data',
        dialogText:
          'Importing a new file will overwrite the existing summary results data. Are you sure you want to proceed?',
        onClose: () => dialogContext.setYesNoDialog({ open: false }),
        onNo: () => dialogContext.setYesNoDialog({ open: false }),
        open: true,
        onYes: () => {
          setOpenImportSummaryResults(true);
          dialogContext.setYesNoDialog({ open: false });
        }
      });
    } else {
      setOpenImportSummaryResults(true);
    }
  };

  const showDeleteDialog = () => {
    if (summaryData) {
      dialogContext.setYesNoDialog({
        dialogTitle: 'Delete Summary Results Data?',
        dialogText:
          'Are you sure you want to delete the summary results data for this survey? This action cannot be undone.',
        yesButtonProps: { color: 'secondary' },
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
      <H2ButtonToolbar
        label="Summary Results"
        buttonProps={{ variant: 'contained', color: 'primary' }}
        buttonLabel="Import"
        buttonTitle="Import Summary Results"
        buttonStartIcon={<Icon path={mdiImport} size={1} />}
        buttonOnClick={() => showUploadDialog()}
      />

      <Divider />

      <Box p={3}>
        {/* Data is still loading/ validating */}
        {!summaryData && !surveyContext.summaryDataLoader.isReady && <SummaryResultsLoading fileLoading={fileName} />}

        {/* No summary */}
        {!surveyContext.summaryDataLoader.data && surveyContext.summaryDataLoader.isReady && (
          <NoSummaryResults clickToImport={() => setOpenImportSummaryResults(true)} />
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
