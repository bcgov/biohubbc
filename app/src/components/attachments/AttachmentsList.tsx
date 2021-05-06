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
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { DATE_FORMAT } from 'constants/dateFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import { handleChangeRowsPerPage, handleChangePage } from 'utils/tablePaginationUtils';

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
  projectId: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<IGetProjectAttachment>({
    id: (null as unknown) as number,
    fileName: (null as unknown) as string,
    lastModified: (null as unknown) as string,
    size: (null as unknown) as number
  });

  const deleteAttachment = async () => {
    if (!attachmentToDelete || !attachmentToDelete.id) {
      return;
    }

    try {
      const response = await biohubApi.project.deleteProjectAttachment(props.projectId, attachmentToDelete.id);

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
      const response = await biohubApi.project.getAttachmentSignedURL(props.projectId, attachment.id);

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      return error;
    }
  };

  return (
    <>
      <YesNoDialog
        dialogTitle="Delete Attachment"
        dialogText="Are you sure you want to delete the selected attachment?"
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onNo={() => setShowDeleteModal(false)}
        onYes={() => {
          setShowDeleteModal(false);
          deleteAttachment();
        }}
      />
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
                    <TableCell>{row.size / 1000000} MB</TableCell>
                    <TableCell align="right" className={clsx(index === 0 && classes.tableCellBorderTop)}>
                      <IconButton
                        color="primary"
                        aria-label="delete-attachment"
                        data-testid="delete-attachment"
                        onClick={() => {
                          setAttachmentToDelete(row);
                          setShowDeleteModal(true);
                        }}>
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
