import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import {
  mdiDownload,
  mdiLockOpenVariantOutline,
  mdiLockOutline,
  mdiDotsVertical,
  mdiInformationOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment, IGetReportMetaData } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedDate, getFormattedFileSize } from 'utils/Utils';
import { IEditReportMetaForm } from '../attachments/EditReportMetaForm';
import EditFileWithMetaDialog from '../dialog/EditFileWithMetaDialog';
import ViewFileWithMetaDialog from '../dialog/ViewFileWithMetaDialog';
import { EditReportMetaDataI18N } from 'constants/i18n';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { AttachmentType } from '../../constants/attachments';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  },
  uploadMenu: {
    marginTop: theme.spacing(1)
  }
}));

export interface IAttachmentsListProps {
  projectId: number;
  surveyId?: number;
  attachmentsList: (IGetProjectAttachment | IGetSurveyAttachment)[];
  getAttachments: (forceFetch: boolean) => void;
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [reportMetaData, setReportMetaData] = useState<IGetReportMetaData | null>(null);
  const [showViewFileWithMetaDialog, setShowViewFileWithMetaDialog] = useState<boolean>(false);
  const [showEditFileWithMetaDialog, setShowEditFileWithMetaDialog] = useState<boolean>(false);

  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | IGetSurveyAttachment | null>(null);

  const handleDownloadFileClick = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    openAttachment(attachment);
  };

  const handleDeleteFileClick = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    showDeleteAttachmentDialog(attachment);
  };

  const handleViewDetailsClick = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    setCurrentAttachment(attachment);
    getReportMeta(attachment);
  };

  const dialogContext = useContext(DialogContext);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditReportMetaDataI18N.editErrorTitle,
    dialogText: EditReportMetaDataI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Attachment',
    dialogText: 'Are you sure you want to delete the selected attachment?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  useEffect(() => {
    if (reportMetaData && currentAttachment) {
      setShowViewFileWithMetaDialog(true);
    }
  }, [reportMetaData, currentAttachment]);

  const showDeleteAttachmentDialog = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteAttachment(attachment);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const showToggleSecurityStatusAttachmentDialog = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      dialogTitle: 'Change Security Status',
      dialogText: attachment.securityToken
        ? `Changing this attachment's security status to unsecured will make it accessible by all users. Are you sure you want to continue?`
        : `Changing this attachment's security status to secured will restrict it to yourself and other authorized users. Are you sure you want to continue?`,
      open: true,
      onYes: () => {
        if (attachment.securityToken) {
          makeAttachmentUnsecure(attachment);
        } else {
          makeAttachmentSecure(attachment);
        }
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteAttachment = async (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    if (!attachment?.id) {
      return;
    }

    try {
      if (!props.surveyId) {
        await biohubApi.project.deleteProjectAttachment(
          props.projectId,
          attachment.id,
          attachment.fileType,
          attachment.securityToken
        );
      } else if (props.surveyId) {
        await biohubApi.survey.deleteSurveyAttachment(
          props.projectId,
          props.surveyId,
          attachment.id,
          attachment.fileType,
          attachment.securityToken
        );
      }

      props.getAttachments(true);
    } catch (error) {
      return error;
    }
  };

  const getReportMeta = async (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    try {
      let response;

      if (props.surveyId) {
        response = await biohubApi.survey.getSurveyReportMetadata(props.projectId, props.surveyId, attachment.id);
      } else {
        response = await biohubApi.project.getProjectReportMetadata(props.projectId, attachment.id);
      }

      if (!response) {
        return;
      }

      setReportMetaData(response);
    } catch (error) {
      return error;
    }
  };

  const openAttachment = async (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    try {
      let response;

      if (props.surveyId) {
        response = await biohubApi.survey.getSurveyAttachmentSignedURL(
          props.projectId,
          props.surveyId,
          attachment.id,
          attachment.fileType
        );
      } else {
        response = await biohubApi.project.getAttachmentSignedURL(props.projectId, attachment.id, attachment.fileType);
      }

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      return error;
    }
  };

  const openAttachmentFromReportMetaDialog = async () => {
    if (currentAttachment) {
      openAttachment(currentAttachment);
    }
  };

  const openEditReportMetaDialog = async () => {
    setShowViewFileWithMetaDialog(false);
    setShowEditFileWithMetaDialog(true);
  };

  const makeAttachmentSecure = async (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    if (!attachment || !attachment.id) {
      return;
    }

    try {
      let response;

      if (props.surveyId) {
        response = await biohubApi.survey.makeAttachmentSecure(
          props.projectId,
          props.surveyId,
          attachment.id,
          attachment.fileType
        );
      } else {
        response = await biohubApi.project.makeAttachmentSecure(props.projectId, attachment.id, attachment.fileType);
      }

      if (!response) {
        return;
      }

      props.getAttachments(true);
    } catch (error) {
      return error;
    }
  };

  const makeAttachmentUnsecure = async (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    if (!attachment || !attachment.id) {
      return;
    }

    try {
      let response;

      if (props.surveyId) {
        response = await biohubApi.survey.makeAttachmentUnsecure(
          props.projectId,
          props.surveyId,
          attachment.id,
          attachment.securityToken,
          attachment.fileType
        );
      } else {
        response = await biohubApi.project.makeAttachmentUnsecure(
          props.projectId,
          attachment.id,
          attachment.securityToken,
          attachment.fileType
        );
      }

      if (!response) {
        return;
      }

      props.getAttachments(true);
    } catch (error) {
      return error;
    }
  };

  const handleDialogEditSave = async (values: IEditReportMetaForm) => {
    if (!reportMetaData) {
      return;
    }

    const fileMeta = values;

    try {
      if (props.surveyId) {
        await biohubApi.survey.updateSurveyAttachmentMetadata(
          props.projectId,
          props.surveyId,
          reportMetaData.attachment_id,
          AttachmentType.REPORT,
          fileMeta,
          reportMetaData.revision_count
        );
      } else {
        await biohubApi.project.updateProjectAttachmentMetadata(
          props.projectId,
          reportMetaData.attachment_id,
          AttachmentType.REPORT,
          fileMeta,
          reportMetaData.revision_count
        );
      }
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    } finally {
      setShowEditFileWithMetaDialog(false);
    }
  };

  return (
    <>
      <ViewFileWithMetaDialog
        open={showViewFileWithMetaDialog}
        onEdit={openEditReportMetaDialog}
        onClose={() => {
          setShowViewFileWithMetaDialog(false);
        }}
        onDownload={openAttachmentFromReportMetaDialog}
        reportMetaData={reportMetaData}
        attachmentSize={(currentAttachment && getFormattedFileSize(currentAttachment.size)) || '0 KB'}
      />
      <EditFileWithMetaDialog
        open={showEditFileWithMetaDialog}
        dialogTitle={'Edit Upload Report'}
        reportMetaData={reportMetaData}
        onClose={() => {
          setShowEditFileWithMetaDialog(false);
        }}
        onSave={handleDialogEditSave}
      />
      <Paper>
        <TableContainer>
          <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell width="150px">Security Status</TableCell>
                <TableCell width="50px"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.attachmentsList.length > 0 &&
                props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                  return (
                    <TableRow key={`${row.fileName}-${index}`}>
                      <TableCell scope="row">
                        <Link underline="always" component="button" variant="body2" onClick={() => openAttachment(row)}>
                          {row.fileName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.fileType}</TableCell>
                      <TableCell>{getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, row.lastModified)}</TableCell>
                      <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                      <TableCell>
                        <Box my={-1}>
                          <Button
                            color="primary"
                            variant="text"
                            startIcon={
                              <Icon path={row.securityToken ? mdiLockOutline : mdiLockOpenVariantOutline} size={1} />
                            }
                            aria-label="toggle attachment security status"
                            data-testid="toggle-attachment-security-status"
                            onClick={() => showToggleSecurityStatusAttachmentDialog(row)}>
                            {row.securityToken ? 'Secured' : 'Unsecured'}
                          </Button>
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <AttachmentItemMenuButton
                          attachment={row}
                          handleDownloadFileClick={handleDownloadFileClick}
                          handleDeleteFileClick={handleDeleteFileClick}
                          handleViewDetailsClick={handleViewDetailsClick}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              {!props.attachmentsList.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Attachments
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {props.attachmentsList.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={props.attachmentsList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
            onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeRowsPerPage(event, setPage, setRowsPerPage)
            }
          />
        )}
      </Paper>
    </>
  );
};

export default AttachmentsList;

interface IAttachmentItemMenuButtonProps {
  attachment: IGetProjectAttachment | IGetSurveyAttachment;
  handleDownloadFileClick: (attachment: IGetProjectAttachment | IGetSurveyAttachment) => void;
  handleDeleteFileClick: (attachment: IGetProjectAttachment | IGetSurveyAttachment) => void;
  handleViewDetailsClick: (attachment: IGetProjectAttachment | IGetSurveyAttachment) => void;
}

const AttachmentItemMenuButton: React.FC<IAttachmentItemMenuButtonProps> = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box my={-1}>
        <Box>
          <IconButton
            color="primary"
            aria-label="delete attachment"
            onClick={handleClick}
            data-testid="attachment-action-menu">
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
          <Menu
            className={classes.uploadMenu}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <MenuItem
              onClick={() => {
                props.handleDownloadFileClick(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-download">
              <ListItemIcon>
                <Icon path={mdiDownload} size={1} />
              </ListItemIcon>
              Download File
            </MenuItem>
            {props.attachment.fileType === AttachmentType.REPORT && (
              <MenuItem
                onClick={() => {
                  props.handleViewDetailsClick(props.attachment);
                  setAnchorEl(null);
                }}
                data-testid="attachment-action-menu-details">
                <ListItemIcon>
                  <Icon path={mdiInformationOutline} size={1} />
                </ListItemIcon>
                View Details
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                props.handleDeleteFileClick(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-delete">
              <ListItemIcon>
                <Icon path={mdiTrashCanOutline} size={1} />
              </ListItemIcon>
              Delete File
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </>
  );
};
