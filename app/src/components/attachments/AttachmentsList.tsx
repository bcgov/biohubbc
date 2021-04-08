import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  IconButton,
  Paper,
  TableRow,
  TableHead,
  TableContainer,
  TableCell,
  TableBody,
  Table,
  TablePagination,
  Link
} from '@material-ui/core';
import Icon from '@mdi/react';
import { mdiTrashCanOutline } from '@mdi/js';
import clsx from 'clsx';
import { getFormattedDate } from 'utils/Utils';
import { DATE_FORMAT } from 'constants/dateFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';

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
  getAttachments: () => void;
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteAttachment = async (attachment: any) => {
    try {
      const response = await biohubApi.project.deleteProjectAttachment(props.projectId, attachment.id);

      if (!response) {
        return;
      }

      props.getAttachments();
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
                    <IconButton color="primary" aria-label="delete-attachment" onClick={() => deleteAttachment(row)}>
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
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default AttachmentsList;
