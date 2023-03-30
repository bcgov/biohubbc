import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { ISurveySummarySupplementaryData } from 'interfaces/useSummaryResultsApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import FileSummaryResults from './summary-results/FileSummaryResults';
import NoSummaryResults from './summary-results/NoSummaryResults';
import SummaryResultsErrors from './summary-results/SummaryResultsErrors';
import SummaryResultsLoading from './summary-results/SummaryResultsLoading';

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
  const [refreshData, setRefreshData] = useState(false);

  // provide file name for 'loading' ui before submission responds
  const [fileName, setFileName] = useState('');

  //Summary Data Loader and Error Handling
  const summaryDataLoader = useDataLoader(() => biohubApi.survey.getSurveySummarySubmission(projectId, surveyId));
  useDataLoaderError(summaryDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Summary Details',
      dialogText:
        'An error has occurred while attempting to load summary details, please try again. If the error persists, please contact your system administrator.'
    };
  });

  const summaryData = summaryDataLoader.data?.surveySummaryData;
  const submissionMessages = summaryDataLoader?.data?.surveySummaryData.messages || [];

  const importSummaryResults = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey
        .uploadSurveySummaryResults(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        .finally(() => {
          setRefreshData(true);
          setFileName(file.name);
        });
    };
  };

  const softDeleteSubmission = async () => {
    if (summaryData) {
      await biohubApi.survey.deleteSummarySubmission(projectId, surveyId, summaryData.survey_summary_submission_id);
      summaryDataLoader.clearData();
    }
  };

  const defaultUploadYesNoDialogProps = {
    dialogTitle: 'Import New Summary Results Data',
    dialogText:
      'Importing a new file will overwrite the existing summary results data. Are you sure you want to proceed?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const defaultDeleteYesNoDialogProps = {
    ...defaultUploadYesNoDialogProps,
    dialogTitle: 'Delete Summary Results Data',
    dialogText: 'Are you sure you want to delete this file? This action cannot be undone.'
  };

  summaryDataLoader.load();

  //Rerender summary data when the survey data loader changes
  useEffect(() => {
    summaryDataLoader.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.surveyDataLoader]);

  const showUploadDialog = () => {
    setRefreshData(false);
    if (summaryData) {
      // already have summary data, prompt user to confirm override
      dialogContext.setYesNoDialog({
        ...defaultUploadYesNoDialogProps,
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
    dialogContext.setYesNoDialog({
      ...defaultDeleteYesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'secondary' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'default' },
      noButtonLabel: 'Cancel',
      onYes: () => {
        softDeleteSubmission();
        dialogContext.setYesNoDialog({ open: false });
        surveyContext.surveyDataLoader.refresh(projectId, surveyId);
      }
    });
  };

  const checkSubmissionStatus = (
    supplementaryData: ISurveySummarySupplementaryData | null | undefined
  ): BioHubSubmittedStatusType => {
    if (supplementaryData?.event_timestamp) {
      return BioHubSubmittedStatusType.SUBMITTED;
    }
    return BioHubSubmittedStatusType.UNSUBMITTED;
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
      <Paper elevation={0}>
        <H2ButtonToolbar
          label="Summary Results"
          buttonProps={{ variant: 'contained', color: 'primary' }}
          buttonLabel="Import"
          buttonTitle="Import Summary Results"
          buttonStartIcon={<Icon path={mdiImport} size={1} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Divider></Divider>

        <Box p={3}>
          {/* No summary */}
          {!summaryData && !summaryDataLoader?.isLoading && (
            <NoSummaryResults clickToImport={() => setOpenImportSummaryResults(true)} />
          )}

          {/* Data is still loading/ validating */}
          {summaryDataLoader.isLoading && <SummaryResultsLoading fileLoading={fileName} />}

          {/* Got a summary with errors */}
          {summaryData && submissionMessages.length > 0 && (
            <SummaryResultsErrors
              fileName={summaryData.fileName}
              messages={summaryData.messages}
              downloadFile={viewFileContents}
              showDelete={showDeleteDialog}
            />
          )}

          {/* All done */}
          {summaryData && !summaryDataLoader.isLoading && submissionMessages.length <= 0 && (
            <FileSummaryResults
              fileName={summaryData.fileName}
              fileStatus={checkSubmissionStatus(summaryDataLoader.data?.surveySummarySupplementaryData)}
              downloadFile={viewFileContents}
              showDelete={showDeleteDialog}
            />
          )}
        </Box>
      </Paper>

      <ComponentDialog
        open={openImportSummaryResults}
        dialogTitle="Import Summary Results Data"
        onClose={() => {
          if (refreshData) {
            summaryDataLoader.refresh();
          }
          setOpenImportSummaryResults(false);
          summaryDataLoader.refresh();
          surveyContext.surveyDataLoader.refresh(projectId, surveyId);
        }}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.xls, .xlsm, .xlsx' }}
          uploadHandler={importSummaryResults()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveySummaryResults;
