import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Icon from '@mdi/react';
import { grey } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
  mdiCheckboxOutline,
  mdiDotsVertical,
  mdiInformationOutline,
  mdiTrashCanOutline,
  mdiTrayArrowDown
} from '@mdi/js';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import AllAttachmentDetailsDialog from 'components/dialog/security/AllAttachmentDetailsDialog';
import { AttachmentsI18N, EditReportMetaDataI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { IAttachmentType } from 'features/projects/view/ProjectAttachments';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';
import AttachmentStatusChip from './AttachmentStatusChip';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentsTable: {
    tableLayout: 'fixed'
  },
  attachmentsTableLockIcon: {
    marginTop: '3px',
    color: grey[600]
  }
}));

export interface IAttachmentsListProps {
  projectId: number;
  surveyId?: number;
  attachmentsList: (IGetProjectAttachment | IGetSurveyAttachment)[];
  getAttachments: (forceFetch: boolean) => void;
  onCheckboxChange?: (attachmentType: IAttachmentType) => void;
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [rowsPerPage] = useState(10);
  const [page] = useState(0);

  const [showViewFileWithDetailsDialog, setShowViewFileWithDetailsDialog] = useState<boolean>(false);

  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | IGetSurveyAttachment | null>(null);

  const handleDownloadFileClick = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    openAttachment(attachment);
  };

  const handleDeleteFileClick = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    showDeleteAttachmentDialog(attachment);
  };

  const handleViewDetailsClick = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    console.log('attachment', attachment);
    setCurrentAttachment(attachment);
    setShowViewFileWithDetailsDialog(true);
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
    dialogTitle: 'Delete Document',
    dialogText: 'Are you sure you want to delete the selected document? This action cannot be undone.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteAttachmentDialog = (attachment: IGetProjectAttachment | IGetSurveyAttachment) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'secondary' },
      onYes: () => {
        deleteAttachment(attachment);
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

  return (
    <>
      <AllAttachmentDetailsDialog
        projectId={props.projectId}
        surveyId={props.surveyId}
        currentAttachment={currentAttachment}
        open={showViewFileWithDetailsDialog}
        close={() => {
          setShowViewFileWithDetailsDialog(false);
          props.getAttachments(true);
        }}
      />

      <Box>
        <TableContainer>
          <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell width="60px" padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell width="140px">Status</TableCell>
                <TableCell width="80px"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.attachmentsList.length > 0 &&
                props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                  return (
                    <TableRow key={`${row.fileName}-${index}`}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checkedIcon={<Icon path={mdiCheckboxOutline} size={1} />}
                          value={index}
                          onChange={(e) => {
                            const attachment: IAttachmentType[] = props.attachmentsList
                              .filter((item, index) => index === Number(e.target.value))
                              .map((item) => {
                                return { id: item.id, type: item.fileType } as IAttachmentType;
                              });
                            props.onCheckboxChange?.(attachment[0]);
                          }}
                        />
                      </TableCell>
                      <TableCell scope="row">
                        <Link
                          style={{ fontWeight: 'bold' }}
                          underline="always"
                          component="button"
                          onClick={() => openAttachment(row)}>
                          {row.fileName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.fileType}</TableCell>
                      <TableCell>
                        <AttachmentStatusChip status={row.status} securityRuleCount={row.securityRuleCount} />
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
                    <strong>No Documents</strong>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
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
          <IconButton aria-label="Document actions" onClick={handleClick} data-testid="attachment-action-menu">
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
          <Menu
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
                <Icon path={mdiTrayArrowDown} size={0.875} />
              </ListItemIcon>
              Download Document
            </MenuItem>
            <MenuItem
              onClick={() => {
                props.handleViewDetailsClick(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-details">
              <ListItemIcon>
                <Icon path={mdiInformationOutline} size={0.8} />
              </ListItemIcon>
              View Document Details
            </MenuItem>

            <MenuItem
              onClick={() => {
                props.handleDeleteFileClick(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-delete">
              <ListItemIcon>
                <Icon path={mdiTrashCanOutline} size={0.8} />
              </ListItemIcon>
              Delete Document
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </>
  );
};
