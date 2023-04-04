import { createStyles, LinearProgress, withStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {
  mdiAlertCircleOutline,
  mdiDotsVertical,
  mdiFileAlertOutline,
  mdiFileOutline,
  mdiImport,
  mdiInformationOutline,
  mdiTrashCanOutline,
  mdiTrayArrowDown
} from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
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

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '82px',
    padding: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: theme.palette.text.secondary
    },
    '&.error': {
      borderColor: theme.palette.error.main,
      '& .importFile-icon': {
        color: theme.palette.error.main
      }
    }
  },
  browseLink: {
    cursor: 'pointer'
  },
  center: {
    alignSelf: 'center'
  },
  alertLink: {
    color: 'inherit'
  },
  alertActions: {
    '& > *': {
      marginLeft: theme.spacing(0.5)
    }
  },
  summaryFileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));

export enum ClassGrouping {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}

const SurveySummaryResults = () => {
  const BorderLinearProgress = withStyles((theme: Theme) =>
    createStyles({
      root: {
        height: 6,
        borderRadius: 3
      },
      colorPrimary: {
        backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 300 : 700]
      },
      bar: {
        borderRadius: 3,
        backgroundColor: '#1976D2'
      }
    })
  )(LinearProgress);
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

  const projectId = surveyContext.projectId as number;
  const surveyId = surveyContext.surveyId as number;

  const classes = useStyles();

  const [openImportSummaryResults, setOpenImportSummaryResults] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  // provide file name for 'loading' ui before submission responds
  const [fileName, setFileName] = useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
          setAnchorEl(null);
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
    dialogTitle: 'Delete Summary Results Data?',
    dialogText:
      'Are you sure you want to delete the summary results data for this survey? This action cannot be undone.'
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

  type MessageGrouping = { [key: string]: { type: string[]; label: string } };

  const messageGrouping: MessageGrouping = {
    mandatory: {
      type: ['Missing Required Field', 'Missing Required Header', 'Duplicate Header'],
      label: 'Mandatory fields have not been filled out'
    },
    recommended: {
      type: ['Missing Recommended Header'],
      label: 'Recommended fields have not been filled out'
    },
    value_not_from_list: {
      type: ['Invalid Value'],
      label: "Values have not been selected from the field's dropdown list"
    },
    unsupported_header: {
      type: ['Unknown Header'],
      label: 'Column headers are not supported'
    },
    out_of_range: {
      type: ['Out of Range'],
      label: 'Values are out of range'
    },
    formatting_errors: {
      type: ['Unexpected Format'],
      label: 'Unexpected formats in the values provided'
    },
    miscellaneous: { type: ['Miscellaneous'], label: 'Miscellaneous errors exist in your file' },
    user_error: {
      type: ['Failed to Get Validation Rules'],
      label: 'Failed to get validation rules'
    },
    system_error: {
      type: ['Missing Validation Schema'],
      label: 'Contact your system administrator'
    }
  };

  type SubmissionErrors = { [key: string]: string[] };
  type SubmissionWarnings = { [key: string]: string[] };

  const submissionErrors: SubmissionErrors = {};
  const submissionWarnings: SubmissionWarnings = {};
  const messageList = summaryData?.messages;

  if (messageList) {
    Object.entries(messageGrouping).forEach(([key, value]) => {
      submissionMessages.forEach((message) => {
        if (value.type.includes(message.type)) {
          if (message.class === ClassGrouping.ERROR) {
            if (!submissionErrors[key]) {
              submissionErrors[key] = [];
            }
            submissionErrors[key].push(message.message);
          }

          if (message.class === ClassGrouping.WARNING) {
            if (!submissionWarnings[key]) {
              submissionWarnings[key] = [];
            }

            submissionWarnings[key].push(message.message);
          }
        }
      });
    });
  }
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

  type SeverityLevel = 'error' | 'info' | 'success' | 'warning';

  let submissionStatusIcon = mdiFileOutline;
  let submissionStatusSeverity: SeverityLevel = 'info';

  if (submissionMessages?.some((messageType) => messageType.type === 'Error')) {
    submissionStatusIcon = mdiFileAlertOutline;
    submissionStatusSeverity = 'error';
  } else if (submissionMessages?.some((messageType) => messageType.type === 'Warning')) {
    submissionStatusIcon = mdiFileAlertOutline;
    submissionStatusSeverity = 'warning';
  } else if (submissionMessages?.some((messageType) => messageType.type === 'Notice')) {
    submissionStatusIcon = mdiInformationOutline;
  }

  function displayMessages(list: SubmissionErrors | SubmissionWarnings, msgGroup: MessageGrouping, iconName: string) {
    return (
      <Box>
        {Object.entries(list).map(([key, value], index) => (
          <Box mt={3} key={key} pl={0.25}>
            <Typography variant="body2">
              <strong>{msgGroup[key].label}</strong>
            </Typography>
            <Box component="ul" mt={1} mb={0} pl={4}>
              {value.map((message: string, index2: number) => {
                return (
                  <li key={`${index}-${index2}`}>
                    <Typography variant="body2" component="span">
                      {message}
                    </Typography>
                  </li>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  const openContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeContextMenu = () => {
    setAnchorEl(null);
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
            <Paper variant="outlined" className={classes.importFile}>
              <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
                <Typography data-testid="observations-nodata" variant="body2" color="textSecondary" component="div">
                  No Summary Results. &nbsp;
                  <Link onClick={() => setOpenImportSummaryResults(true)} className={classes.browseLink}>
                    Click Here to Import
                  </Link>
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Data is still loading/ validating */}
          {summaryDataLoader.isLoading && (
            <>
              <Paper variant="outlined" className={clsx(classes.importFile, submissionStatusSeverity)}>
                <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                    <Box className="importFile-icon" flex="0 0 auto" mr={2}>
                      <Icon path={submissionStatusIcon} size={1} />
                    </Box>
                    <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                      <Typography
                        className={classes.summaryFileName}
                        variant="body2"
                        component="div"
                        onClick={viewFileContents}>
                        <strong>{fileName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box ml={5} mr={1}>
                    <Typography variant="body2" color="textSecondary">
                      Importing file. Please wait...
                    </Typography>
                    <Box mt={1.5}>
                      <BorderLinearProgress />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </>
          )}

          {/* Got a summary with errors */}
          {summaryData && submissionMessages.length > 0 && (
            <Box>
              <Alert severity="error" icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
                <AlertTitle>Failed to import summary results</AlertTitle>
                One or more errors occurred while attempting to import your summary results file.
                {displayMessages(submissionErrors, messageGrouping, mdiAlertCircleOutline)}
                {displayMessages(submissionWarnings, messageGrouping, mdiInformationOutline)}
              </Alert>

              <Box mt={3}>
                <Paper variant="outlined" className={clsx(classes.importFile, 'error')}>
                  <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                    <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                      <Box display="flex" alignItems="center" flex="0 0 auto" className="importFile-icon" mr={2}>
                        <Icon path={mdiFileAlertOutline} size={1} />
                      </Box>
                      <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                        <Typography
                          className={classes.summaryFileName}
                          variant="body2"
                          component="div"
                          onClick={viewFileContents}>
                          <strong>{summaryData.fileName}</strong>
                        </Typography>
                      </Box>
                    </Box>
                    <Box flex="0 0 auto" display="flex" alignItems="center">
                      <IconButton aria-controls="context-menu" aria-haspopup="true" onClick={openContextMenu}>
                        <Icon path={mdiDotsVertical} size={1} />
                      </IconButton>
                      <Menu
                        keepMounted
                        id="context-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeContextMenu}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}>
                        <MenuItem onClick={viewFileContents}>
                          <ListItemIcon>
                            <Icon path={mdiTrayArrowDown} size={1} />
                          </ListItemIcon>
                          Download
                        </MenuItem>
                        <MenuItem onClick={showDeleteDialog}>
                          <ListItemIcon>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </ListItemIcon>
                          Delete
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}

          {/* All done */}
          {summaryData && !summaryDataLoader.isLoading && submissionMessages.length <= 0 && (
            <>
              <Paper variant="outlined" className={clsx(classes.importFile, submissionStatusSeverity)}>
                <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                    <Box display="flex" alignItems="center" flex="0 0 auto" className="importFile-icon" mr={2}>
                      <Icon path={submissionStatusIcon} size={1} />
                    </Box>
                    <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                      <Typography
                        className={classes.summaryFileName}
                        variant="body2"
                        component="div"
                        onClick={viewFileContents}>
                        <strong>{summaryData.fileName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box flex="0 0 auto" display="flex" alignItems="center">
                    <Box mr={2}>
                      <SubmitStatusChip
                        status={checkSubmissionStatus(summaryDataLoader.data?.surveySummarySupplementaryData)}
                      />
                    </Box>

                    <Box>
                      <IconButton aria-controls="context-menu" aria-haspopup="true" onClick={openContextMenu}>
                        <Icon path={mdiDotsVertical} size={1} />
                      </IconButton>
                      <Menu
                        keepMounted
                        id="context-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeContextMenu}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}>
                        <MenuItem onClick={viewFileContents}>
                          <ListItemIcon>
                            <Icon path={mdiTrayArrowDown} size={1} />
                          </ListItemIcon>
                          Download
                        </MenuItem>
                        <MenuItem onClick={showDeleteDialog}>
                          <ListItemIcon>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </ListItemIcon>
                          Delete
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </>
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
