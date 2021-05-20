import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { DATE_FORMAT } from 'constants/dateFormats';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  }
});

export interface IAttachmentsListProps {
  id: number;
  type: string;
  attachmentsList: IGetProjectAttachment[];
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

  const deleteAttachment = async (attachment: IGetProjectAttachment) => {
    if (!attachment?.id) {
      return;
    }

    try {
      let response;

      if (props.type === 'project') {
        response = await biohubApi.project.deleteProjectAttachment(props.id, attachment.id);
      } else if (props.type === 'survey') {
        response = await biohubApi.survey.deleteSurveyAttachment(props.id, attachment.id);
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

      if (props.type === 'project') {
        response = await biohubApi.project.getAttachmentSignedURL(props.id, attachment.id);
      } else if (props.type === 'survey') {
        response = await biohubApi.survey.getAttachmentSignedURL(props.id, attachment.id);
      }

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      return error;
    }
  };

  const getFormattedFileSize = (fileSize: number) => {
    // kilobyte size
    if (fileSize < 1000000) {
      return `${(fileSize / 1000).toFixed(1)} KB`;
    }

    // megabyte size
    if (fileSize < 1000000000) {
      return `${(fileSize / 1000000).toFixed(1)} MB`;
    }

    // gigabyte size
    return `${(fileSize / 1000000000).toFixed(1)} GB`;
  };

  return (
    <>
      <Paper>
        <TableContainer>
          <Table className={classes.table} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Name</TableCell>
                <TableCell className={classes.heading}>Last Modified</TableCell>
                <TableCell className={classes.heading}>File Size</TableCell>
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
                    <TableCell>{getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, row.lastModified)}</TableCell>
                    <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                    <TableCell align="right" className={clsx(index === 0 && classes.tableCellBorderTop)}>
                      <IconButton
                        color="primary"
                        aria-label="delete-attachment"
                        data-testid="delete-attachment"
                        onClick={() => showDeleteAttachmentDialog(row)}>
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {!props.attachmentsList.length && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
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
