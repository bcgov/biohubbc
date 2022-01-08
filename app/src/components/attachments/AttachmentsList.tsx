import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
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
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectAttachment, IGetReportMetaData } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedDate, getFormattedFileSize } from 'utils/Utils';
import { IEditReportMetaForm } from '../attachments/EditReportMetaForm';
import EditFileWithMetaDialog from '../dialog/EditFileWithMetaDialog';
import ViewFileWithMetaDialog from '../dialog/ViewFileWithMetaDialog';
import { EditReportMetaDataI18N, AttachmentsI18N } from 'constants/i18n';
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
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const restorationTrackerApi = useRestorationTrackerApi();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [reportMetaData, setReportMetaData] = useState<IGetReportMetaData | null>(null);
  const [showViewFileWithMetaDialog, setShowViewFileWithMetaDialog] = useState<boolean>(false);
  const [showEditFileWithMetaDialog, setShowEditFileWithMetaDialog] = useState<boolean>(false);

  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | null>(null);

  const handleDownloadFileClick = (attachment: IGetProjectAttachment) => {
    openAttachment(attachment);
  };

  const handleDeleteFileClick = (attachment: IGetProjectAttachment) => {
    showDeleteAttachmentDialog(attachment);
  };

  const handleViewDetailsClick = (attachment: IGetProjectAttachment) => {
    setCurrentAttachment(attachment);
    getReportMeta(attachment);
  };

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditReportMetaDataI18N.editErrorTitle,
    dialogText: EditReportMetaDataI18N.editErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
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

  const showDeleteAttachmentDialog = (attachment: IGetProjectAttachment) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteAttachment(attachment);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const showToggleSecurityStatusAttachmentDialog = (attachment: IGetProjectAttachment) => {
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

  const deleteAttachment = async (attachment: IGetProjectAttachment) => {
    if (!attachment?.id) {
      return;
    }

    try {
      await restorationTrackerApi.project.deleteProjectAttachment(
        props.projectId,
        attachment.id,
        attachment.fileType,
        attachment.securityToken
      );

      props.getAttachments(true);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({
        dialogTitle: AttachmentsI18N.deleteErrorTitle,
        dialogText: AttachmentsI18N.deleteErrorText,
        dialogErrorDetails: apiError.errors,
        open: true
      });
      return;
    }
  };

  const getReportMeta = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await restorationTrackerApi.project.getProjectReportMetadata(props.projectId, attachment.id);

      if (!response) {
        return;
      }

      setReportMetaData(response);
    } catch (error) {
      return error;
    }
  };

  const openAttachment = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await restorationTrackerApi.project.getAttachmentSignedURL(
        props.projectId,
        attachment.id,
        attachment.fileType
      );

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({
        dialogTitle: AttachmentsI18N.downloadErrorTitle,
        dialogText: AttachmentsI18N.downloadErrorText,
        dialogErrorDetails: apiError.errors,
        open: true
      });
      return;
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

  const makeAttachmentSecure = async (attachment: IGetProjectAttachment) => {
    if (!attachment || !attachment.id) {
      return;
    }

    try {
      const response = await restorationTrackerApi.project.makeAttachmentSecure(
        props.projectId,
        attachment.id,
        attachment.fileType
      );

      if (!response) {
        return;
      }

      props.getAttachments(true);
    } catch (error) {
      return error;
    }
  };

  const makeAttachmentUnsecure = async (attachment: IGetProjectAttachment) => {
    if (!attachment || !attachment.id) {
      return;
    }

    try {
      const response = await restorationTrackerApi.project.makeAttachmentUnsecure(
        props.projectId,
        attachment.id,
        attachment.securityToken,
        attachment.fileType
      );

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
      await restorationTrackerApi.project.updateProjectReportMetadata(
        props.projectId,
        reportMetaData.attachment_id,
        AttachmentType.REPORT,
        fileMeta,
        reportMetaData.revision_count
      );
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
      <Box>
        <TableContainer>
          <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell width="150px">Security</TableCell>
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
                      <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                      <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.lastModified)}</TableCell>
                      <TableCell>
                        <Box my={-1}>
                          <Button
                            size="small"
                            color="primary"
                            variant="outlined"
                            startIcon={
                              <Icon path={row.securityToken ? mdiLockOutline : mdiLockOpenVariantOutline} size={0.75} />
                            }
                            aria-label="toggle attachment security status"
                            data-testid="toggle-attachment-security-status"
                            onClick={() => showToggleSecurityStatusAttachmentDialog(row)}>
                            <strong>{row.securityToken ? 'Secured' : 'Unsecured'}</strong>
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
                  <TableCell colSpan={6} align="center">
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
      </Box>
    </>
  );
};

export default AttachmentsList;

interface IAttachmentItemMenuButtonProps {
  attachment: IGetProjectAttachment;
  handleDownloadFileClick: (attachment: IGetProjectAttachment) => void;
  handleDeleteFileClick: (attachment: IGetProjectAttachment) => void;
  handleViewDetailsClick: (attachment: IGetProjectAttachment) => void;
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
