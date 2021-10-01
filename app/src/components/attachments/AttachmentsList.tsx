import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { mdiLockOutline, mdiLockOpenVariantOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedDate, getFormattedFileSize } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
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

  const dialogContext = useContext(DialogContext);

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Attachment',
    dialogText: 'Are you sure you want to delete the selected attachment?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

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
      let response;

      if (!props.surveyId) {
        response = await biohubApi.project.deleteProjectAttachment(
          props.projectId,
          attachment.id,
          attachment.fileType,
          attachment.securityToken
        );
      } else if (props.surveyId) {
        response = await biohubApi.survey.deleteSurveyAttachment(
          props.projectId,
          props.surveyId,
          attachment.id,
          attachment.fileType,
          attachment.securityToken
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

  const viewFileContents = async (attachment: any) => {
    try {
      let response;

      if (props.surveyId) {
        response = await biohubApi.survey.getSurveyAttachmentSignedURL(props.projectId, props.surveyId, attachment.id);
      } else {
        response = await biohubApi.project.getAttachmentSignedURL(props.projectId, attachment.id);
      }

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      return error;
    }
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

  return (
    <>
      <Paper>
        <TableContainer>
          <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Security Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.attachmentsList.length > 0 &&
                props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={row.fileName}>
                    <TableCell component="th" scope="row">
                      <Link underline="always" component="button" variant="body2" onClick={() => viewFileContents(row)}>
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
                      <Box my={-1}>
                        <IconButton
                          color="primary"
                          aria-label="delete attachment"
                          data-testid="delete-attachment"
                          onClick={() => showDeleteAttachmentDialog(row)}>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
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
